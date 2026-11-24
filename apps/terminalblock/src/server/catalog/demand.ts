import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Best-seller order and "often ordered with" lists, from the catalog snapshot (src/data/catalog/ranking.json).
 * The snapshot holds only part ids in order: no order counts or other sales figures.
 */
const FILE = path.join(process.cwd(), "src", "data", "catalog", "ranking.json");
type RankingFile = { order: string[]; together?: Record<string, string[]> };
let cached: RankingFile | null = null;

function load(): RankingFile {
  if (cached && process.env.NODE_ENV === "production") return cached;
  try {
    cached = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, "utf8")) as RankingFile) : { order: [] };
  } catch {
    cached = { order: [] };
  }
  return cached;
}

/** Catalog ids, best-selling first. */
export function rankedIds(): string[] {
  return load().order;
}

/** Catalog ids most often on the same orders as this part, best first. */
export function oftenOrderedWith(id: string): string[] {
  return load().together?.[id] ?? [];
}
