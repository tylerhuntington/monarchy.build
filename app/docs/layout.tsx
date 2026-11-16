import { DocsNavigation } from "@/components/docs-navigation";
import { docGroups, getSearchIndex } from "@/lib/docs.mjs";
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="docs-shell">
      <DocsNavigation entries={getSearchIndex()} groups={docGroups} />
      {children}
    </div>
  );
}
