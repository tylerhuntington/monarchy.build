#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    source: { type: "string" },
    revision: { type: "string" },
    "reviewed-curated": { type: "boolean", default: false },
  },
});
if (
  !values.source ||
  !values.revision ||
  !/^[a-f\d]{40}$/.test(values.revision)
) {
  throw new Error(
    "Usage: node scripts/sync-docs.mjs --source /path/to/monarchy --revision FULL_SHA [--reviewed-curated]",
  );
}

const root = path.join(process.cwd(), "content");
const file = path.join(root, "docs-manifest.json");
const manifest = JSON.parse(readFileSync(file, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const source = (sourcePath) =>
  execFileSync("git", [
    "-C",
    values.source,
    "show",
    `${values.revision}:${sourcePath}`,
  ]);
// Resolve every source and reject unreviewed derived changes before writing anything.
const updates = manifest.documents.map((doc) => {
  const upstream = source(doc.sourcePath);
  const sources = doc.derivedFrom?.map(({ path: sourcePath, sha256 }) => {
    const newHash = hash(source(sourcePath));
    if (newHash !== sha256 && !values["reviewed-curated"]) {
      throw new Error(
        `${doc.slug} depends on changed source ${sourcePath}. Review its prose, then pass --reviewed-curated.`,
      );
    }
    return { path: sourcePath, sha256: newHash };
  });
  const body =
    doc.kind === "imported"
      ? upstream
      : readFileSync(path.join(root, "docs", `${doc.slug}.md`));
  return {
    body,
    doc: {
      ...doc,
      sha256: hash(body),
      sourceSha256: hash(upstream),
      ...(sources && { derivedFrom: sources }),
    },
  };
});
for (const { body, doc } of updates)
  writeFileSync(path.join(root, "docs", `${doc.slug}.md`), body);
manifest.revision = values.revision;
manifest.documents = updates.map(({ doc }) => doc);
writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Updated ${updates.length} documents at ${values.revision}. Run npm test and review the diff.`,
);
