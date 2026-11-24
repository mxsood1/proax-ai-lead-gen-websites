import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { sampleProducts, type Catalog, type Product } from "./products";
import { rankedIds } from "@/server/catalog/demand";
import { partSlug } from "@/lib/part-slug";

/**
 * Loads the catalog on the server (at build / render time) from the committed snapshot in
 * src/data/catalog/ (parts, yes/no stock flags, best-seller order). The site has no connection
 * to the featured supplier's systems. If the snapshot is missing, it falls back to sample data.
 */
const DIR = path.join(process.cwd(), "src", "data", "catalog");
const PARTS = path.join(DIR, "parts.json");
const STOCK = path.join(DIR, "stock.json");
/** Exact-part images (catalog id -> image); see public/part-images/README.md */
const IMAGES = path.join(process.cwd(), "src", "data", "part-images.json");

let cached: Catalog | null = null;

function readJson<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

/**
 * How many part pages to publish. Google treats large batches of thin, templated pages as spam
 * ("scaled content abuse"), so only the best-selling parts with real data (an image or stock status,
 * plus specs) get a page. Raise this gradually once the first pages are indexed and earning leads.
 */
export const PART_PAGE_LIMIT = 200;

/** A part earns a page only when there is something real to show beyond its name. */
const earnsPage = (p: Product) => Boolean(p.image || p.inStock) && (p.wireMax !== null || p.awg !== null || p.current !== null || p.fn === "accessory");

function withImagesAndStock(items: Product[]): Product[] {
  const images = readJson<Record<string, Product["image"]>>(IMAGES) ?? {};
  const stock = readJson<{ inStock: Record<string, true> }>(STOCK)?.inStock ?? {};
  const merged = items.map((p) => ({ ...p, ...(images[p.id] ? { image: images[p.id] } : {}), ...(stock[p.id] ? { inStock: true } : {}) }));

  // Part pages go to the best sellers first
  const byId = new Map(merged.map((p) => [p.id, p]));
  const withPage = new Set(
    rankedIds()
      .map((id) => byId.get(id))
      .filter((p): p is Product => p !== undefined && earnsPage(p))
      .slice(0, PART_PAGE_LIMIT)
      .map((p) => p.id),
  );
  return merged.map((p) => (withPage.has(p.id) ? { ...p, page: `/parts/${partSlug(p)}` } : p));
}

export function getCatalog(): Catalog {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const raw = readJson<{ snapshotDate?: string; items: Product[] }>(PARTS);
  if (raw && Array.isArray(raw.items) && raw.items.length > 0) {
    cached = { items: withImagesAndStock(raw.items), source: "supplier", exportedAt: raw.snapshotDate ?? null };
    return cached;
  }
  cached = { items: sampleProducts, source: "sample", exportedAt: null };
  return cached;
}
