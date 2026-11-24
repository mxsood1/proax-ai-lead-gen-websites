import "server-only";
import { z } from "zod";
import { structured } from "./claude";

export const PhotoIdSchema = z.object({
  isTerminalBlock: z.boolean().describe("False if the photo does not show a terminal block or its label"),
  manufacturer: z.string().nullable().describe("Only if a logo or printed name is legible; otherwise null"),
  series: z.string().nullable().describe("Series printed on the block, e.g. 'UT 4' or 'PT 2,5'. Null if not legible"),
  partNumber: z.string().nullable().describe("Only if a full order number is legible. Never guess"),
  connection: z.enum(["push-in", "spring", "screw", "unknown"]),
  function: z.enum(["feed-through", "ground", "fuse", "disconnect", "multi-level", "pcb", "accessory", "unknown"]),
  colour: z.string().describe("Housing colour, e.g. grey, blue, green-yellow"),
  sizeEstimate: z.string().nullable().describe("Approximate conductor size class if it can be inferred, e.g. '2.5 mm²'. Null if not"),
  confidence: z.number().int().min(0).max(100),
  observations: z.array(z.string()).describe("Short visual facts that support the identification"),
});
export type PhotoId = z.infer<typeof PhotoIdSchema>;

const SYSTEM = `You identify DIN-rail terminal blocks and their accessories from photos for an industrial parts distributor.
Report only what is visible. Read printed text carefully. If a manufacturer, series or part number is not clearly legible, return null for it instead of guessing.
Grey/beige blocks are usually feed-through; green-yellow are ground (PE); blue is commonly neutral. Orange buttons usually indicate push-in release levers; a round slotted screw head indicates screw clamp; a rectangular slot for a screwdriver next to the wire entry usually indicates spring clamp.`;

export type ImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export function identifyPhoto(bytes: Uint8Array, mediaType: ImageType) {
  return structured(PhotoIdSchema, {
    system: SYSTEM,
    effort: "medium",
    maxTokens: 4000,
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: Buffer.from(bytes).toString("base64") } },
      { type: "text", text: "Identify this part." },
    ],
  });
}
