import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  getDocs,
  getDoc,
  getHeadings,
  headingId,
  normalizeDocLink,
  docGroups,
  getSearchIndex,
  sourceRevision,
  sourceRepository,
} from "../lib/docs.mjs";

const manifest = JSON.parse(readFileSync("content/docs-manifest.json", "utf8"));

test("every page is pinned, hash-checked and reachable from the documentation navigation", () => {
  assert.match(sourceRevision, /^[a-f\d]{40}$/);
  assert.equal(
    new Set(getDocs().map(({ slug }) => slug)).size,
    getDocs().length,
  );
  assert.deepEqual(
    docGroups.flatMap(({ slugs }) => slugs),
    getDocs().map(({ slug }) => slug),
  );
  assert.ok(getDocs().length >= 12);
  for (const doc of getDocs()) {
    assert.equal(
      createHash("sha256").update(doc.body).digest("hex"),
      doc.sha256,
    );
    assert.equal(
      doc.sourceUrl,
      `${sourceRepository}/blob/${sourceRevision}/${doc.sourcePath}`,
    );
    assert.match(doc.sourceSha256, /^[a-f\d]{64}$/);
    if (doc.kind === "imported") assert.equal(doc.sha256, doc.sourceSha256);
    else
      assert.ok(
        doc.derivedFrom.length > 0,
        `${doc.slug} needs primary-source evidence`,
      );
  }
  assert.equal(manifest.repository, sourceRepository);
  assert.equal(getDoc("missing-page"), undefined);
});

test("heading IDs ignore code examples and retain inline-code text", () => {
  const body =
    "# Title\n\n## Read `inbox`\n\n```sh\n## not a heading\n```\n\n## Read `inbox`\n";
  assert.deepEqual(getHeadings(body), [
    { id: "title", text: "Title", level: 1 },
    { id: "read-inbox", text: "Read inbox", level: 2 },
    { id: "read-inbox-1", text: "Read inbox", level: 2 },
  ]);
  assert.equal(
    headingId("4. Get the result in the Queen's thread"),
    "4-get-the-result-in-the-queens-thread",
  );
});

test("links use local docs when available and immutable source for other files", () => {
  assert.equal(
    normalizeDocLink(
      "runtime.md#give-the-secretary-a-brief",
      "docs/quickstart.md",
    ),
    "/docs/runtime#give-the-secretary-a-brief",
  );
  assert.equal(
    normalizeDocLink("../docs/README.md", "roles/queen.md"),
    "/docs/introduction",
  );
  assert.equal(
    normalizeDocLink("../monarchy/records.py", "docs/runtime-records.md"),
    `${sourceRepository}/blob/${sourceRevision}/monarchy/records.py`,
  );
  assert.equal(
    normalizeDocLink("../.agents/skills", "docs/skills.md"),
    `${sourceRepository}/tree/${sourceRevision}/.agents/skills`,
  );
  assert.equal(
    normalizeDocLink("https://example.com/a?q=1#b", "docs/skills.md"),
    "https://example.com/a?q=1#b",
  );
  assert.equal(normalizeDocLink("javascript:alert(1)", "docs/skills.md"), "#");
});

test("all local documentation links and fragments resolve", () => {
  for (const doc of getDocs()) {
    const withoutCode = doc.body.replace(/```[\s\S]*?```/g, "");
    const hrefs = [...withoutCode.matchAll(/\]\(([^\s)]+)\)/g)].map(
      (match) => match[1],
    );
    for (const href of hrefs) {
      const normalized = normalizeDocLink(href, doc.sourcePath);
      if (!normalized.startsWith("/docs/") && !normalized.startsWith("#"))
        continue;
      const [pathname, fragment] = normalized.split("#");
      const target = pathname
        ? getDoc(pathname.slice("/docs/".length).split("?")[0])
        : doc;
      assert.ok(target, `${doc.slug}: missing target ${href}`);
      if (fragment) {
        assert.ok(
          getHeadings(target.body).some(({ id }) => id === fragment),
          `${doc.slug}: missing fragment ${href}`,
        );
      }
    }
    const headingIds = getHeadings(doc.body).map(({ id }) => id);
    assert.equal(
      new Set(headingIds).size,
      headingIds.length,
      `${doc.slug}: duplicate heading anchors`,
    );
  }
});

test("search includes all visible guide bodies without leaking loader metadata", () => {
  const index = getSearchIndex();
  assert.equal(index.length, getDocs().length);
  assert.ok(
    index.find(({ slug }) => slug === "cli").body.includes("prepare-dispatch"),
  );
  assert.deepEqual(Object.keys(index[0]).sort(), [
    "body",
    "description",
    "section",
    "slug",
    "title",
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(index)), index);
});
