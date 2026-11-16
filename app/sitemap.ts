import type { MetadataRoute } from "next";
import { getDocs } from "@/lib/docs.mjs";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://monarchy.build/", priority: 1 },
    { url: "https://monarchy.build/docs/", priority: 0.9 },
    ...getDocs()
      .filter((x) => x.slug !== "introduction")
      .map((doc) => ({
        url: `https://monarchy.build/docs/${doc.slug}/`,
        priority: 0.7,
      })),
  ];
}
