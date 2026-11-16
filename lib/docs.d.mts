export interface DocHeading {
  id: string;
  text: string;
  level: number;
}
export interface Doc {
  slug: string;
  title: string;
  description: string;
  section: string;
  kind: "imported" | "adapted" | "authored";
  body: string;
  toc: DocHeading[];
  sourcePath: string;
  sourceRevision: string;
  sourceUrl: string;
  sha256: string;
  sourceSha256: string;
  derivedFrom?: { path: string; sha256: string }[];
}
export const sourceRevision: string;
export const sourceRepository: string;
export const docGroups: { title: string; slugs: string[] }[];
export function headingId(text: string): string;
export function getHeadings(body: string): DocHeading[];
export function normalizeDocLink(href: string, sourcePath: string): string;
export function getDocs(): Doc[];
export function getDoc(slug: string): Doc | undefined;
export function getSearchIndex(): Pick<
  Doc,
  "slug" | "title" | "description" | "section" | "body"
>[];
