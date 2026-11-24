import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getPublishedGuides } from "@/server/content/published";
import { productTypes } from "@/data/types";
import { partsWithPages } from "@/server/catalog/parts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getPublishedGuides();
  const staticPages = ["", "/rfq", "/finder", "/identify", "/types", "/guides", "/about"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...productTypes.map((t) => ({ url: `${site.url}/types/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...guides.map((g) => ({ url: `${site.url}/guides/${g.slug}`, lastModified: g.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...partsWithPages().map((p) => ({ url: `${site.url}${p.page}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
