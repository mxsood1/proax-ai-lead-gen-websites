/**
 * Product model shared by the sample data and the catalog snapshot (src/data/catalog).
 * Specs are nullable: real ERP records rarely carry every attribute, so tools
 * must treat "unknown" honestly instead of guessing.
 */
import type { ModuleVariant } from "@/components/brand/TerminalModule";

export type Connection = "push-in" | "spring" | "screw";
export type BlockFunction = "feed-through" | "ground" | "fuse" | "disconnect" | "multi-level" | "pcb" | "accessory";
export type Mounting = "din" | "pcb" | "panel";

export type Product = {
  id: string;
  /** Manufacturer part number as a buyer would type it */
  partNumber: string;
  manufacturer: string;
  /** Series / family, when known */
  series: string | null;
  description: string;
  connection: Connection | null;
  fn: BlockFunction;
  mounting: Mounting | null;
  wireMin: number | null; // mm²
  wireMax: number | null; // mm²
  awg: string | null;
  current: number | null; // A
  voltage: number | null; // V
  width: number | null; // mm
  levels: 1 | 2 | 3;
  variant: ModuleVariant;
  /** Manufacturer catalog image of this exact part (transparent PNG), when one is available */
  image?: { src: string; width: number; height: number };
  /** In stock at the featured supplier (from the catalog snapshot; yes/no only, never a quantity) */
  inStock?: boolean;
  /** Link to this part's own page, when it has one (only parts with enough real data get a page) */
  page?: string;
};

export type Catalog = {
  items: Product[];
  source: "sample" | "supplier";
  exportedAt: string | null;
};

type SampleRow = Omit<Product, "partNumber" | "series" | "mounting"> & { series: string; mounting: Mounting };

const rows: SampleRow[] = [
  { id: "pc-pt-2-5", manufacturer: "Phoenix Contact", series: "PT 2,5", description: "Push-in feed-through, grey", connection: "push-in", fn: "feed-through", mounting: "din", wireMin: 0.14, wireMax: 4, awg: "26–12", current: 24, voltage: 800, width: 5.2, levels: 1, variant: "grey" },
  { id: "pc-pt-4", manufacturer: "Phoenix Contact", series: "PT 4", description: "Push-in feed-through, grey", connection: "push-in", fn: "feed-through", mounting: "din", wireMin: 0.2, wireMax: 6, awg: "24–10", current: 32, voltage: 800, width: 6.2, levels: 1, variant: "grey" },
  { id: "pc-pt-2-5-pe", manufacturer: "Phoenix Contact", series: "PT 2,5-PE", description: "Push-in ground, green-yellow", connection: "push-in", fn: "ground", mounting: "din", wireMin: 0.14, wireMax: 4, awg: "26–12", current: null, voltage: null, width: 5.2, levels: 1, variant: "ground" },
  { id: "pc-ut-4", manufacturer: "Phoenix Contact", series: "UT 4", description: "Screw feed-through, grey", connection: "screw", fn: "feed-through", mounting: "din", wireMin: 0.14, wireMax: 6, awg: "26–10", current: 32, voltage: 1000, width: 6.2, levels: 1, variant: "grey" },
  { id: "wago-2002-1201", manufacturer: "WAGO", series: "TOPJOB S 2002", description: "Push-in 2-conductor feed-through", connection: "push-in", fn: "feed-through", mounting: "din", wireMin: 0.25, wireMax: 4, awg: "22–12", current: 24, voltage: 800, width: 5.2, levels: 1, variant: "grey" },
  { id: "wago-2002-1207", manufacturer: "WAGO", series: "TOPJOB S 2002 PE", description: "Push-in ground, green-yellow", connection: "push-in", fn: "ground", mounting: "din", wireMin: 0.25, wireMax: 4, awg: "22–12", current: null, voltage: null, width: 5.2, levels: 1, variant: "ground" },
  { id: "wago-2002-2201", manufacturer: "WAGO", series: "TOPJOB S 2002 double-deck", description: "Push-in 2-level feed-through", connection: "push-in", fn: "multi-level", mounting: "din", wireMin: 0.25, wireMax: 4, awg: "22–12", current: 24, voltage: 500, width: 5.2, levels: 2, variant: "blue" },
  { id: "wago-280", manufacturer: "WAGO", series: "280 series", description: "Spring-clamp (CAGE CLAMP) feed-through", connection: "spring", fn: "feed-through", mounting: "din", wireMin: 0.08, wireMax: 2.5, awg: "28–12", current: 24, voltage: 800, width: 5, levels: 1, variant: "grey" },
  { id: "wm-a2c-2-5", manufacturer: "Weidmüller", series: "A2C 2.5", description: "PUSH IN feed-through, 2 levels", connection: "push-in", fn: "multi-level", mounting: "din", wireMin: 0.14, wireMax: 4, awg: "26–12", current: 24, voltage: 500, width: 5.1, levels: 2, variant: "grey" },
  { id: "wm-wdu-4", manufacturer: "Weidmüller", series: "WDU 4", description: "Screw feed-through, beige", connection: "screw", fn: "feed-through", mounting: "din", wireMin: 0.5, wireMax: 6, awg: "22–10", current: 32, voltage: 800, width: 6.1, levels: 1, variant: "grey" },
  { id: "wm-wsi-6", manufacturer: "Weidmüller", series: "WSI 6", description: "Screw fuse block, 5 × 20 mm", connection: "screw", fn: "fuse", mounting: "din", wireMin: 0.5, wireMax: 10, awg: "22–8", current: 10, voltage: 500, width: 8, levels: 1, variant: "fuse" },
  { id: "pc-uk-5-hesi", manufacturer: "Phoenix Contact", series: "UK 5-HESI", description: "Screw fuse block with LED", connection: "screw", fn: "fuse", mounting: "din", wireMin: 0.2, wireMax: 6, awg: "24–10", current: 6.3, voltage: 500, width: 8.2, levels: 1, variant: "fuse" },
  { id: "pc-pt-4-mt", manufacturer: "Phoenix Contact", series: "PT 4-MT", description: "Push-in knife disconnect", connection: "push-in", fn: "disconnect", mounting: "din", wireMin: 0.2, wireMax: 6, awg: "24–10", current: 20, voltage: 400, width: 6.2, levels: 1, variant: "orange" },
  { id: "ab-1492-j4", manufacturer: "Allen-Bradley", series: "1492-J4", description: "Screw feed-through, grey", connection: "screw", fn: "feed-through", mounting: "din", wireMin: 0.5, wireMax: 6, awg: "22–10", current: 32, voltage: 800, width: 6, levels: 1, variant: "grey" },
  { id: "dinkle-dk2-5n", manufacturer: "Dinkle", series: "DK2.5N", description: "Screw feed-through, grey", connection: "screw", fn: "feed-through", mounting: "din", wireMin: 0.2, wireMax: 4, awg: "24–12", current: 24, voltage: 800, width: 5.2, levels: 1, variant: "grey" },
  { id: "abb-zs4", manufacturer: "ABB Entrelec", series: "ZS4", description: "Spring feed-through, grey", connection: "spring", fn: "feed-through", mounting: "din", wireMin: 0.2, wireMax: 4, awg: "24–12", current: 32, voltage: 800, width: 6, levels: 1, variant: "grey" },
  { id: "pc-mstb-2-5", manufacturer: "Phoenix Contact", series: "MSTB 2,5 / 5.08", description: "Pluggable PCB terminal, 5.08 mm pitch", connection: "screw", fn: "pcb", mounting: "pcb", wireMin: 0.2, wireMax: 2.5, awg: "24–12", current: 12, voltage: 320, width: 5.08, levels: 1, variant: "dark" },
  { id: "wago-2604", manufacturer: "WAGO", series: "2604 series", description: "Push-in PCB terminal, 5 mm pitch", connection: "push-in", fn: "pcb", mounting: "pcb", wireMin: 0.2, wireMax: 4, awg: "24–12", current: 24, voltage: 320, width: 5, levels: 1, variant: "dark" },
];

/** SAMPLE DATA for the design phase only — approximate, typical ratings. */
export const sampleProducts: Product[] = rows.map((r) => ({ ...r, partNumber: r.series }));

export const AWG_TO_MM2: { awg: string; mm2: number }[] = [
  { awg: "24 AWG", mm2: 0.2 },
  { awg: "22 AWG", mm2: 0.34 },
  { awg: "20 AWG", mm2: 0.5 },
  { awg: "18 AWG", mm2: 0.75 },
  { awg: "16 AWG", mm2: 1.5 },
  { awg: "14 AWG", mm2: 2.5 },
  { awg: "12 AWG", mm2: 4 },
  { awg: "10 AWG", mm2: 6 },
  { awg: "8 AWG", mm2: 10 },
];

export const normalizePn = (s: string) => s.toUpperCase().replace(/[\s,._\-/]+/g, "");

/** Encode RFQ lines into a URL: /rfq?line=PN|MFR&line=… (no catalog needed on the RFQ page). */
export function rfqHref(items: Pick<Product, "partNumber" | "manufacturer">[], q?: string) {
  const p = new URLSearchParams();
  for (const i of items) p.append("line", `${i.partNumber}|${i.manufacturer}`);
  if (q) p.set("q", q);
  const s = p.toString();
  return s ? `/rfq?${s}` : "/rfq";
}
