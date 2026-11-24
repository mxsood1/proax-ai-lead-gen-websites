import type { Product } from "@/data/products";
import { equivalentsFor, findMatch } from "@/lib/catalog-match";
import type { LeadLine, LineMatch } from "@/server/leads/types";

/** Match each RFQ line against the catalog and suggest equivalents (for human review). */
export function matchLines(lines: LeadLine[], products: Product[]): LineMatch[] {
  return lines.map((line, i) => {
    const found = findMatch(products, line.part);
    if (!found) {
      return { line: i, status: "none", partNumber: null, manufacturer: null, description: null, equivalents: [] };
    }
    const { match, exact } = found;
    return {
      line: i,
      status: exact ? "exact" : "likely",
      partNumber: match.partNumber,
      manufacturer: match.manufacturer,
      description: match.description,
      equivalents: equivalentsFor(products, match).map((e) => ({
        partNumber: e.partNumber,
        manufacturer: e.manufacturer,
        description: e.description,
      })),
    };
  });
}
