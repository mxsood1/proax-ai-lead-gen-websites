/**
 * Catalog matching shared by the Identify tool (browser) and the sourcing
 * pipeline (server). Pure functions — no I/O.
 */
import { normalizePn, type Product } from "@/data/products";

export type MatchResult = { match: Product; exact: boolean } | null;

export function findMatch(products: Product[], q: string): MatchResult {
  const n = normalizePn(q);
  if (n.length < 2) return null;

  // 1. Exact manufacturer part number ("3003017")
  const exact = products.find((p) => normalizePn(p.partNumber) === n);
  if (exact) return { match: exact, exact: true };

  // 2. Exact series as printed on the block ("UK 4") — prefer the plain feed-through version
  const bySeries = products
    .filter((p) => p.series && normalizePn(p.series) === n)
    .sort((a, b) => Number(b.fn === "feed-through") - Number(a.fn === "feed-through"));
  if (bySeries[0]) return { match: bySeries[0], exact: true };

  // 3. Partial part number ("304410")
  if (n.length >= 4) {
    const partial = products
      .filter((p) => {
        const pn = normalizePn(p.partNumber);
        return pn.includes(n) || (pn.length >= 4 && n.includes(pn));
      })
      .sort((a, b) => a.partNumber.length - b.partNumber.length)[0];
    if (partial) return { match: partial, exact: false };
  }

  // 4. Words from a worn label or a description ("UK 4 gray")
  const tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.length) {
    const fuzzy = products
      .filter((p) => {
        const words = `${p.series ?? ""} ${p.description}`.toLowerCase().split(/[^a-z0-9]+/);
        return tokens.every((t) => words.some((w) => w.startsWith(t)));
      })
      .sort((a, b) => (a.series?.length ?? 99) - (b.series?.length ?? 99))[0];
    if (fuzzy) return { match: fuzzy, exact: false };
  }
  return null;
}

export function equivalentsFor(
  products: Product[],
  p: Pick<Product, "id" | "fn" | "connection" | "wireMax" | "manufacturer">,
  limit = 3,
) {
  return products
    .filter(
      (x) =>
        x.id !== p.id &&
        x.fn === p.fn &&
        x.manufacturer !== p.manufacturer &&
        (p.wireMax === null || x.wireMax === null || Math.abs(x.wireMax - p.wireMax) <= 2),
    )
    .sort(
      (a, b) =>
        Number(b.connection === p.connection) - Number(a.connection === p.connection) ||
        Number(b.wireMax === p.wireMax) - Number(a.wireMax === p.wireMax),
    )
    .slice(0, limit);
}
