import { notFound } from "next/navigation";
import { DocPage } from "@/components/doc-page";
import { getDoc, getDocs } from "@/lib/docs.mjs";
export const dynamicParams = false;
export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  return doc
    ? {
        title: doc.title,
        description: doc.description,
        alternates: {
          canonical: slug === "introduction" ? "/docs/" : `/docs/${slug}/`,
        },
      }
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
