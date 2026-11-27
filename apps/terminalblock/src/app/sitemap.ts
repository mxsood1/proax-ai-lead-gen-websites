import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getPublishedGuides } from "@/server/content/published";
import { productTypes } from "@/data/types";
import { allPairs, pairSlug } from "@/data/brands";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getPublishedGuides();
  const staticPages = ["", "/compare", "/types", "/guides", "/about"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...allPairs().map(([a, b]) => ({ url: `${site.url}/compare/${pairSlug(a.slug, b.slug)}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...productTypes.map((t) => ({ url: `${site.url}/types/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...guides.map((g) => ({ url: `${site.url}/guides/${g.slug}`, lastModified: g.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
