import "server-only";
import { getCatalog } from "@/data/catalog";
import { getPublishedGuides } from "@/server/content/published";
import { equivalentsFor } from "@/lib/catalog-match";
import type { BlockFunction, Product } from "@/data/products";
import { oftenOrderedWith } from "./demand";

/** Parts that have their own page (see PART_PAGE_LIMIT in data/catalog.ts). */
export function partsWithPages(): Product[] {
  return getCatalog().items.filter((p) => p.page);
}

export function getPartBySlug(slug: string): Product | null {
  return getCatalog().items.find((p) => p.page === `/parts/${slug}`) ?? null;
}

export function oftenWith(p: Product, limit = 4): Product[] {
  const byId = new Map(getCatalog().items.map((x) => [x.id, x]));
  return oftenOrderedWith(p.id)
    .map((id) => byId.get(id))
    .filter((x): x is Product => x !== undefined)
    .slice(0, limit);
}

/** Possible equivalents from other manufacturers, for the "verify fit" section. */
export function equivalents(p: Product, limit = 3): Product[] {
  const items = getCatalog().items;
  const byId = new Map(items.map((x) => [x.id, x]));
  return equivalentsFor(items, p, limit)
    .map((e) => byId.get(e.id))
    .filter((x): x is Product => x !== undefined);
}

/** Product type page for a part's function. */
export const TYPE_FOR_FN: Partial<Record<BlockFunction, string>> = {
  ground: "ground",
  fuse: "fuse",
  disconnect: "disconnect",
  "multi-level": "multi-level",
  pcb: "pcb",
  accessory: "accessories",
};

export function typeSlugFor(p: Product): string | null {
  if (TYPE_FOR_FN[p.fn]) return TYPE_FOR_FN[p.fn]!;
  if (p.connection === "push-in") return "push-in";
  if (p.connection === "spring") return "spring-clamp";
  if (p.connection === "screw") return "screw-clamp";
  return null;
}

export async function guidesFor(typeSlug: string | null, limit = 2) {
  if (!typeSlug) return [];
  return (await getPublishedGuides()).filter((g) => g.related?.includes(typeSlug)).slice(0, limit);
}

/** Manufacturer product page for the datasheet link, where the URL pattern is known and stable. */
export function datasheetUrl(p: Product): string | null {
  if (p.manufacturer === "Phoenix Contact" && /^\d{7}$/.test(p.partNumber)) return `https://www.phoenixcontact.com/en-ca/products/${p.partNumber}`;
  return null;
}
