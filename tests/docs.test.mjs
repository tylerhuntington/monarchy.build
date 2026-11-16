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

test("sync preserves adapted prose and requires review when its toolkit source changes", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const { execFileSync, spawnSync } = await import("node:child_process");
  const directory = mkdtempSync(path.join(tmpdir(), "monarchy-docs-sync-"));
  const upstream = path.join(directory, "toolkit");
  const website = path.join(directory, "website");
  const script = path.resolve("scripts/sync-docs.mjs");
  const hash = (body) => createHash("sha256").update(body).digest("hex");
  const original =
    "# Start a court\n\n```sh\nmonarchy --court example.json\n```\n";
  const adapted =
    "# Build your empire\n\n```sh\nmonarchy --court example.json\n```\n";
  try {
    mkdirSync(upstream, { recursive: true });
    mkdirSync(path.join(website, "content/docs"), { recursive: true });
    const git = (...args) =>
      execFileSync("git", ["-C", upstream, ...args], {
        encoding: "utf8",
      }).trim();
    git("init", "--quiet");
    git("config", "user.name", "Documentation fixture");
    git("config", "user.email", "fixture@example.invalid");
    writeFileSync(path.join(upstream, "guide.md"), original);
    git("add", "guide.md");
    git("commit", "--quiet", "-m", "Initial source");
    const firstRevision = git("rev-parse", "HEAD");
    const fixture = {
      revision: firstRevision,
      documents: [
        {
          slug: "guide",
          kind: "adapted",
          sourcePath: "guide.md",
          sha256: hash(adapted),
          sourceSha256: hash(original),
          derivedFrom: [{ path: "guide.md", sha256: hash(original) }],
        },
      ],
    };
    const manifestPath = path.join(website, "content/docs-manifest.json");
    const pagePath = path.join(website, "content/docs/guide.md");
    writeFileSync(manifestPath, JSON.stringify(fixture));
    writeFileSync(pagePath, adapted);
    const sync = (revision, ...args) =>
      spawnSync(
        process.execPath,
        [script, "--source", upstream, "--revision", revision, ...args],
        { cwd: website, encoding: "utf8" },
      );
    assert.equal(sync(firstRevision).status, 0);
    assert.equal(readFileSync(pagePath, "utf8"), adapted);

    const changed = original + "\nNew runtime behavior.\n";
    writeFileSync(path.join(upstream, "guide.md"), changed);
    git("add", "guide.md");
    git("commit", "--quiet", "-m", "Changed source");
    const nextRevision = git("rev-parse", "HEAD");
    const priorManifest = readFileSync(manifestPath, "utf8");
    const held = sync(nextRevision);
    assert.notEqual(held.status, 0);
    assert.match(held.stderr, /depends on changed source/);
    assert.equal(readFileSync(manifestPath, "utf8"), priorManifest);
    assert.equal(readFileSync(pagePath, "utf8"), adapted);

    assert.equal(sync(nextRevision, "--reviewed-curated").status, 0);
    const updated = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.equal(updated.revision, nextRevision);
    assert.equal(updated.documents[0].sourceSha256, hash(changed));
    assert.equal(updated.documents[0].sha256, hash(adapted));
    assert.equal(readFileSync(pagePath, "utf8"), adapted);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
