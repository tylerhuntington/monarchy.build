import { readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const contentRoot = path.join(process.cwd(), "content");
const manifest = JSON.parse(
  readFileSync(path.join(contentRoot, "docs-manifest.json"), "utf8"),
);

export const sourceRevision = manifest.revision;
export const sourceRepository = manifest.repository;

/** Matches GitHub-style slugs for the headings in the curated Markdown. */
export function headingId(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

export function getHeadings(body) {
  const headings = [];
  const seen = new Map();
  let fence = null;
  for (const line of body.split("\n")) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length)
        fence = null;
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/);
    if (!heading) continue;
    const text = heading[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[`*_~]/g, "");
    const baseId = headingId(text);
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);
    headings.push({
      id: count ? `${baseId}-${count}` : baseId,
      text,
      level: heading[1].length,
    });
  }
  return headings;
}

const sourcePaths = new Map(
  manifest.documents.map((doc) => [doc.sourcePath, doc.slug]),
);
sourcePaths.set("docs/README.md", "introduction");

/** Map toolkit-relative links onto local guides or immutable source files. */
export function normalizeDocLink(href, sourcePath) {
  if (!href) return "";
  if (href.startsWith("#")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (/^(?:https?:|mailto:)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return "#";
  if (href.startsWith("/")) return href;
  const splitAt = href.search(/[?#]/);
  const target = splitAt < 0 ? href : href.slice(0, splitAt);
  const suffix = splitAt < 0 ? "" : href.slice(splitAt);
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), target),
  );
  const slug = sourcePaths.get(resolved);
  if (slug) return `/docs/${slug}${suffix}`;
  const encoded = resolved.split("/").map(encodeURIComponent).join("/");
  const view = /\.[a-z\d]+$/i.test(path.posix.basename(resolved))
    ? "blob"
    : "tree";
  return `${sourceRepository}/${view}/${sourceRevision}/${encoded}${suffix}`;
}

let cachedDocs;
export function getDocs() {
  if (!cachedDocs) {
    cachedDocs = manifest.documents.map((entry) => {
      const body = readFileSync(
        path.join(contentRoot, "docs", `${entry.slug}.md`),
        "utf8",
      );
      const actualHash = createHash("sha256").update(body).digest("hex");
      if (actualHash !== entry.sha256) {
        throw new Error(
          `Documentation hash mismatch: ${entry.slug}. Review and refresh the manifest.`,
        );
      }
      return {
        ...entry,
        body,
        toc: getHeadings(body).filter(({ level }) => level > 1 && level < 4),
        sourceRevision,
        sourceUrl: `${sourceRepository}/blob/${sourceRevision}/${entry.sourcePath}`,
      };
    });
  }
  return cachedDocs;
}

export function getDoc(slug) {
  return getDocs().find((doc) => doc.slug === slug);
}

export const docGroups = [
  ...new Set(manifest.documents.map((doc) => doc.section)),
].map((title) => ({
  title,
  slugs: manifest.documents
    .filter((doc) => doc.section === title)
    .map((doc) => doc.slug),
}));

export function getSearchIndex() {
  return getDocs().map(({ slug, title, description, section, body }) => ({
    slug,
    title,
    description,
    section,
    body,
  }));
}
