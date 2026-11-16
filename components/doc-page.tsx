import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDocs, getHeadings, type Doc } from "@/lib/docs.mjs";
import { Markdown } from "./markdown";
export function DocPage({ doc }: { doc: Doc }) {
  const all = getDocs();
  const index = all.findIndex((x) => x.slug === doc.slug);
  const previous = all[index - 1],
    next = all[index + 1];
  const href = (slug: string) =>
    slug === "introduction" ? "/docs/" : `/docs/${slug}/`;
  return (
    <div className="docs-main-grid">
      <main id="main" className="doc-article">
        <header className="doc-header">
          <p className="doc-breadcrumb">
            DOCUMENTATION / {doc.section.toUpperCase()}
          </p>
          <h1 id={getHeadings(doc.body)[0]?.id}>{doc.title}</h1>
          <p className="doc-description">{doc.description}</p>
          <a className="doc-source" href={doc.sourceUrl}>
            Toolkit source · {doc.sourceRevision.slice(0, 7)}{" "}
            <ArrowUpRight size={11} />
          </a>
        </header>
        <Markdown body={doc.body} sourcePath={doc.sourcePath} />
        <nav className="doc-pagination" aria-label="Previous and next guide">
          {previous && (
            <Link href={href(previous.slug)}>
              <span>PREVIOUS</span>← {previous.title}
            </Link>
          )}
          {next && (
            <Link href={href(next.slug)}>
              <span>NEXT</span>
              {next.title} →
            </Link>
          )}
        </nav>
      </main>
      <aside className="docs-toc" aria-label="On this page">
        <h2>On this page</h2>
        {doc.toc
          .filter((x) => x.level > 1 && x.level < 4)
          .map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              data-level={heading.level}
            >
              {heading.text}
            </a>
          ))}
        <a className="toc-source" href={doc.sourceUrl}>
          View toolkit source ↗
        </a>
        <a href="https://github.com/tylerhuntington/monarchy.build/issues">
          Report a docs issue ↗
        </a>
      </aside>
    </div>
  );
}
