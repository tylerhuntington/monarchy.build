import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found page-width">
      <span className="eyebrow">404 · OUTSIDE THE EMPIRE</span>
      <h1>This page is off the map.</h1>
      <p>The Queen can’t account for this one. Let’s get you back.</p>
      <Link className="button button-primary" href="/docs/">
        Open the docs →
      </Link>
    </main>
  );
}
