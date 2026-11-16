import { DocPage } from "@/components/doc-page";
import { getDoc } from "@/lib/docs.mjs";
export const metadata = {
  title: "Documentation",
  description:
    "Start a court, meet the roles, and explore the Monarchy runtime and skills.",
  alternates: { canonical: "/docs/" },
};
export default function Docs() {
  return <DocPage doc={getDoc("introduction")!} />;
}
