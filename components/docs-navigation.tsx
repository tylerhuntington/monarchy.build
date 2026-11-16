"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, X } from "lucide-react";
type Entry = {
  slug: string;
  title: string;
  description: string;
  section: string;
  body: string;
};
export function DocsNavigation({
  entries,
  groups,
}: {
  entries: Entry[];
  groups: { title: string; slugs: string[] }[];
}) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  function show() {
    opener.current = document.activeElement as HTMLElement;
    setOpen(true);
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  }
  function close() {
    dialog.current?.close();
    setOpen(false);
    opener.current?.focus();
  }
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          opener.current = document.activeElement as HTMLElement;
          setOpen(true);
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = entries
    .map((entry) => ({
      entry,
      score: terms.reduce(
        (sum, t) =>
          sum +
          (entry.title.toLowerCase().includes(t) ? 8 : 0) +
          (entry.description.toLowerCase().includes(t) ? 3 : 0) +
          (entry.body.toLowerCase().includes(t) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ entry }) =>
      terms.every((t) =>
        (entry.title + " " + entry.description + " " + entry.body)
          .toLowerCase()
          .includes(t),
      ),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  const searchButton = (
    <button className="docs-search-button" onClick={show}>
      <Search size={14} />
      <span>Search docs</span>
      <kbd>⌘ K</kbd>
    </button>
  );
  const nav = (
    <nav aria-label="Documentation">
      {groups.map((group) => (
        <div className="docs-nav-group" key={group.title}>
          <h2>{group.title}</h2>
          {group.slugs.map((slug) => {
            const entry = entries.find((x) => x.slug === slug)!;
            const href = slug === "introduction" ? "/docs/" : `/docs/${slug}/`;
            return (
              <Link
                key={slug}
                href={href}
                aria-current={
                  path.replace(/\/$/, "") === href.replace(/\/$/, "")
                    ? "page"
                    : undefined
                }
                onClick={() => setMenu(false)}
              >
                {entry.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="docs-sidebar">
        {searchButton}
        {nav}
        <p className="sidebar-foot">One conversation. An entire court.</p>
      </aside>
      <div className="docs-mobile-toolbar">
        <button
          aria-expanded={menu}
          aria-controls="docs-mobile-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={15} /> : <BookOpen size={15} />}Documentation
        </button>
        {searchButton}
      </div>
      {menu && (
        <div id="docs-mobile-nav" className="docs-mobile-nav">
          {nav}
        </div>
      )}
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label="Search documentation"
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) {
            const box = dialog.current.getBoundingClientRect();
            if (
              e.clientX < box.left ||
              e.clientX > box.right ||
              e.clientY < box.top ||
              e.clientY > box.bottom
            )
              close();
          }
        }}
      >
        <div className="search-input-row">
          <Search size={18} />
          <input
            ref={input}
            type="search"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close();
              }
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the archives…"
            aria-label="Search documentation"
            autoComplete="off"
          />
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>
        <div className="search-results" aria-live="polite">
          {results.length ? (
            results.map(({ entry }) => (
              <Link
                className="search-result"
                key={entry.slug}
                href={
                  entry.slug === "introduction"
                    ? "/docs/"
                    : `/docs/${entry.slug}/`
                }
                onClick={() => {
                  setMenu(false);
                  close();
                }}
              >
                <strong>{entry.title}</strong>
                <p>{entry.description}</p>
              </Link>
            ))
          ) : (
            <p className="search-empty">
              No pages found for “{query}”. Try a role, command, or topic.
            </p>
          )}
        </div>
        <p className="search-hint">
          Tab to a result · Enter to open · Esc to close
        </p>
      </dialog>
    </>
  );
}
