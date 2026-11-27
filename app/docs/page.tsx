import { DocPage } from "@/components/doc-page";
import { getDoc } from "@/lib/docs.mjs";
export const metadata = {
  title: "Documentation",
  description:
    "Build your fleet. Meet the Queen, Secretary, and 00-Agents, then get to work with the Monarchy guides and reference docs.",
  alternates: { canonical: "/docs/" },
};
export default function Docs() {
  return <DocPage doc={getDoc("introduction")!} />;
}
