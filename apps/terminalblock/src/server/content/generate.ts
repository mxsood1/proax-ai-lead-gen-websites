import "server-only";
import { z } from "zod";
import { guides, type Guide } from "@/data/guides";
import { productTypes } from "@/data/types";
import { site } from "@/config/site";
import { AiUnavailableError, structured } from "@/server/ai/claude";
import { config } from "@/server/config";
import { listDrafts, newDraftId, saveDraft, withHistory, type Draft } from "./store";
import { DUPLICATE_THRESHOLD, similarity } from "./topics";

export { similarity };

/* ------------------------- duplicate protection ------------------------- */

export async function findDuplicate(keyword: string) {
  const existing = [
    ...guides.map((g) => ({ title: g.title, where: `published guide "${g.shortTitle}"` })),
    ...(await listDrafts()).filter((d) => d.status !== "rejected").map((d) => ({ title: `${d.keyword} ${d.guide.title}`, where: `draft "${d.guide.title}"` })),
  ];
  const hit = existing.map((e) => ({ ...e, score: similarity(keyword, e.title) })).sort((a, b) => b.score - a.score)[0];
  return hit && hit.score >= DUPLICATE_THRESHOLD ? hit.where : null;
}

/** Make a slug safe and unique against published guides and other articles. */
export function uniqueSlug(wanted: string, taken: Set<string>) {
  const base =
    wanted
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "guide";
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

async function takenSlugs(exceptId?: string) {
  const drafts = (await listDrafts()).filter((d) => d.id !== exceptId && d.status !== "rejected");
  return new Set([...guides.map((g) => g.slug), ...drafts.map((d) => d.guide.slug)]);
}

const TYPE_SLUGS = productTypes.map((t) => t.slug) as [string, ...string[]];

/* ------------------------------ AI draft ------------------------------ */

const Block = z.union([
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string() }),
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
  z.object({ type: z.literal("callout"), title: z.string(), text: z.string() }),
  z.object({ type: z.literal("table"), head: z.array(z.string()), rows: z.array(z.array(z.string())) }),
]);

const DraftSchema = z.object({
  slug: z.string().describe("lowercase-hyphenated URL slug, under 60 characters"),
  title: z.string().describe("Specific, plain title without a trailing period, under 70 characters"),
  shortTitle: z.string().describe("Two to five words for navigation"),
  description: z.string().describe("One sentence meta description, under 155 characters, no trailing period"),
  category: z.enum(["Selection", "Sizing", "Checklist"]),
  readMinutes: z.number().int().min(2).max(6),
  keyTakeaways: z.array(z.string()).describe("Three short takeaways"),
  body: z.array(Block).describe("400 to 700 words in total. Short paragraphs, practical, no fluff, no marketing hype"),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).describe("Two or three real buyer questions with direct answers"),
  related: z.array(z.enum(TYPE_SLUGS)).describe("One to three product type pages on this site that a reader of this guide should see next"),
  factCheck: z.array(z.string()).describe("Every specific technical claim (ratings, standards, dimensions, colour rules) a human must verify against datasheets or standards before publishing"),
});
type DraftData = z.infer<typeof DraftSchema>;

const SYSTEM = `You write short, practical technical guides for ${site.name}, a Canadian terminal block sourcing site.
Audience: panel builders, electrical engineers, maintenance technicians and buyers.
Rules:
- Stay neutral about manufacturers. Never criticise, rank or compare brands on quality or price, and never claim any company is an authorized distributor, partner or endorser. Name brands only to identify products.
- Do not mention the site's supplier or any distributor by name.
- Be accurate. Never invent ratings, part numbers, prices or statistics. Prefer general, verifiable guidance and say "check the manufacturer's datasheet" where values vary.
- No hype words (seamless, revolutionary, game-changing, unlock, supercharge), no exclamation marks, no emoji.
- Canadian English. Mention North American approvals (UL, CSA) where relevant, alongside IEC.
- Headings and list items without trailing periods. Paragraphs are full sentences.
- Answer the search query directly in the first paragraph, then add the detail a buyer needs to choose or order correctly.
- End with useful FAQs. Do not add a sales pitch; the site adds its own call to action.
Product type pages on the site (for "related"): ${productTypes.map((t) => `${t.slug} (${t.name})`).join(", ")}.`;

async function aiDraft(keyword: string): Promise<DraftData> {
  return structured(DraftSchema, {
    system: SYSTEM,
    effort: "high",
    maxTokens: 16000,
    content: `Write a guide targeting the search query: "${keyword}".\n\nAlready published on the site (do not repeat their content, link ideas only): ${guides.map((g) => g.title).join("; ")}.`,
  });
}

/* --------------------------- outline fallback --------------------------- */

function outline(keyword: string): DraftData {
  const title = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  return {
    slug: keyword,
    title,
    shortTitle: title.split(" ").slice(0, 4).join(" "),
    description: `[Write a one-sentence summary for "${keyword}"]`,
    category: "Selection",
    readMinutes: 3,
    keyTakeaways: ["[Write takeaway 1]", "[Write takeaway 2]", "[Write takeaway 3]"],
    body: [
      { type: "p", text: `[Write: a two-sentence intro answering "${keyword}" directly]` },
      { type: "h2", text: "[Write: the first thing a buyer needs to know]" },
      { type: "p", text: "[Write: explanation with a concrete example]" },
      { type: "h2", text: "[Write: how to choose or compare]" },
      { type: "ul", items: ["[Write: point 1]", "[Write: point 2]", "[Write: point 3]"] },
      { type: "callout", title: "Sourcing tip", text: "[Write: one practical sourcing tip]" },
    ],
    faqs: [{ q: "[Write: a real buyer question]", a: "[Write: a direct answer]" }],
    related: [],
    factCheck: ["Outline only: every section needs writing and checking"],
  };
}

/* -------------------------------- entry -------------------------------- */

export class DuplicateTopicError extends Error {}

export async function createDraft(keyword: string, createdBy: Draft["createdBy"] = "desk"): Promise<Draft> {
  const clean = keyword.trim().slice(0, 120);
  const dup = await findDuplicate(clean);
  if (dup) throw new DuplicateTopicError(`Too similar to the ${dup}.`);

  let source: Draft["source"] = "outline";
  let data = outline(clean);
  if (config.ai.enabled) {
    try {
      data = await aiDraft(clean);
      source = "ai";
    } catch (error) {
      if (!(error instanceof AiUnavailableError)) throw error;
    }
  }

  const now = new Date().toISOString();
  const { factCheck, slug, related, ...rest } = data;
  const finalSlug = uniqueSlug(slug, await takenSlugs());
  const draft: Draft = {
    id: newDraftId(finalSlug),
    keyword: clean,
    status: "draft",
    source,
    createdBy,
    createdAt: now,
    updatedAt: now,
    guide: { ...rest, slug: finalSlug, updated: now.slice(0, 10), related: [...new Set(related)].slice(0, 3) },
    factCheck,
    history: [{ at: now, note: `${source === "ai" ? "AI draft" : "Outline"} created ${createdBy === "schedule" ? "by the weekly schedule" : "from the desk"}` }],
  };
  await saveDraft(draft);
  return draft;
}

/* ------------------------------ AI revision ------------------------------ */

const ReviseSchema = DraftSchema.omit({ slug: true });

/**
 * Ask Claude to revise an article following a reviewer's instruction
 * ("the 5 × 20 fuse rating is wrong, it's 6.3 A max", "shorten the intro").
 * Keeps the URL. Returns the saved article. Only when AI is on.
 */
export async function reviseDraft(draft: Draft, instruction: string): Promise<Draft> {
  if (!config.ai.enabled) throw new AiUnavailableError("AI is off");
  const { slug, updated, published, ...current } = draft.guide;
  const revised = await structured(ReviseSchema, {
    system: `${SYSTEM}\nYou are revising an existing guide. Apply the reviewer's instruction exactly; keep everything else unless it conflicts with the rules. Return the complete revised guide.`,
    effort: "high",
    maxTokens: 16000,
    content: `Reviewer instruction:\n${instruction}\n\nCurrent guide (JSON):\n${JSON.stringify({ ...current, factCheck: draft.factCheck })}`,
  });
  const { factCheck, related, ...rest } = revised;
  const next: Draft = withHistory(
    {
      ...draft,
      guide: { ...rest, slug, updated, published, related: [...new Set(related)].slice(0, 3) } satisfies Guide,
      factCheck,
      source: draft.source === "outline" ? "ai" : draft.source,
    },
    `Revised with AI: ${instruction.slice(0, 200)}`,
  );
  await saveDraft(next);
  return next;
}
