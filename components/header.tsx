"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Crown } from "./brand";
export function Header() {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className={`header-inner ${isDocs ? "header-inner-docs" : "page-width"}`}>
        <Link
          className="brand"
          href="/"
          aria-label="Monarchy home"
          onClick={() => setOpen(false)}
        >
          <Crown />
          <span>monarchy</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link
            href="/docs/"
            aria-current={isDocs ? "page" : undefined}
          >
            Documentation
          </Link>
          <a href="https://github.com/tylerhuntington/monarchy">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <Link className="header-cta" href="/docs/quickstart/">
          Get started <span aria-hidden="true">↗</span>
        </Link>
        <button
          className="mobile-menu-button icon-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          <Link href="/docs/" onClick={() => setOpen(false)}>
            Documentation
          </Link>
          <Link href="/docs/quickstart/" onClick={() => setOpen(false)}>
            Get started
          </Link>
          <a href="https://github.com/tylerhuntington/monarchy">GitHub ↗</a>
        </nav>
      )}
    </header>
  );
}
