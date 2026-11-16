import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codeToHtml, bundledLanguages } from "shiki";
import { CopyButton } from "./copy-button";
import { headingId, normalizeDocLink } from "@/lib/docs.mjs";
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : "",
    )
    .join("");
}
async function CodeBlock({ children }: { children?: ReactNode }) {
  const element = Children.toArray(children).find(isValidElement) as
    | React.ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;
  const text = textOf(element?.props.children ?? children).replace(/\n$/, "");
  const requested =
    element?.props.className?.replace("language-", "") ?? "text";
  const lang = requested in bundledLanguages ? requested : "text";
  const html = await codeToHtml(text, { lang, theme: "github-light" });
  return (
    <div className="code-block">
      <div className="code-label">
        <span>{requested === "text" ? "Plain text" : requested}</span>
        <CopyButton text={text} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
export function Markdown({
  body,
  sourcePath,
}: {
  body: string;
  sourcePath: string;
}) {
  const seen = new Map<string, number>();
  function heading(level: 2 | 3 | 4 | 5 | 6, children: ReactNode) {
    const base = headingId(textOf(children));
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n}` : base;
    const Tag = `h${level}` as "h2";
    return (
      <Tag id={id}>
        <a className="heading-link" href={`#${id}`}>
          {children}
        </a>
      </Tag>
    );
  }
  return (
    <div className="doc-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const id = headingId(textOf(children));
            seen.set(id, (seen.get(id) ?? 0) + 1);
            return null;
          },
          h2: ({ children }) => heading(2, children),
          h3: ({ children }) => heading(3, children),
          h4: ({ children }) => heading(4, children),
          h5: ({ children }) => heading(5, children),
          h6: ({ children }) => heading(6, children),
          a: ({ href, children }) => (
            <a href={normalizeDocLink(href ?? "", sourcePath)}>{children}</a>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
