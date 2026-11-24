/**
 * Pure helpers for the article pipeline (no I/O, so they're easy to test):
 * topic similarity, choosing the next topic, and quality checks on a draft.
 */
import type { Guide, GuideBlock } from "@/data/guides";

/* ------------------------------ similarity ------------------------------ */

const STOP = new Set(["a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "vs", "how", "what", "is", "are", "your", "you", "do", "which", "should", "with"]);
const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)));

/** Share of the smaller topic's meaningful words that also appear in the other (0–1). */
export function similarity(a: string, b: string) {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / Math.min(A.size, B.size);
}

export const DUPLICATE_THRESHOLD = 0.75;

/* ------------------------------ next topic ------------------------------ */

type KeywordLike = { keyword: string; priority: number; coveredBy?: string };
type DraftLike = { keyword: string; status: string };

/**
 * The next search query to write about: highest priority first (1 before 3),
 * then in file order. Skips topics already covered by a published guide,
 * topics with a live (non-rejected) draft, and near-duplicates of existing
 * titles. Rejected drafts don't block a topic from being tried again.
 */
export function pickNextTopic<K extends KeywordLike>(keywords: K[], drafts: DraftLike[], existingTitles: string[]): K | null {
  const live = drafts.filter((d) => d.status !== "rejected");
  const drafted = new Set(live.map((d) => d.keyword.toLowerCase()));
  const titles = [...existingTitles, ...live.map((d) => d.keyword)];
  const ordered = keywords.map((k, i) => ({ k, i })).sort((a, b) => a.k.priority - b.k.priority || a.i - b.i);
  for (const { k } of ordered) {
    if (k.coveredBy) continue;
    if (drafted.has(k.keyword.toLowerCase())) continue;
    if (titles.some((t) => similarity(k.keyword, t) >= DUPLICATE_THRESHOLD)) continue;
    return k;
  }
  return null;
}

/* ---------------------------- quality checks ---------------------------- */

const HYPE = ["seamless", "revolutionary", "game-changing", "game changer", "unlock", "supercharge", "cutting-edge", "world-class", "best-in-class", "unparalleled", "elevate"];
/** Names that shouldn't appear: the site's supplier, or distributors (vendor relationships) */
const SUPPLIER_NAMES = /\b(proax|digi-?key|mouser|newark|allied electronics|rs components|grainger|graybar|wesco|anixter|nedco|eecol|gescan)\b/i;

function blockText(b: GuideBlock): string {
  switch (b.type) {
    case "ul":
      return b.items.join(" ");
    case "callout":
      return `${b.title} ${b.text}`;
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
    default:
      return b.text;
  }
}

export function guideText(g: Guide) {
  return [g.title, g.description, ...g.keyTakeaways, ...g.body.map(blockText), ...g.faqs.flatMap((f) => [f.q, f.a])].join(" ");
}

export function wordCount(g: Guide) {
  return g.body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
}

/**
 * Things a reviewer should look at before approving. Warnings only: the
 * reviewer decides. (Outline placeholders are handled separately and do
 * block approval.)
 */
export function qualityIssues(g: Guide): string[] {
  const issues: string[] = [];
  const all = guideText(g);
  const n = wordCount(g);
  if (n < 350) issues.push(`Short article (${n} words). Aim for at least 350 so it fully answers the search.`);
  if (n > 1200) issues.push(`Long article (${n} words). Over 1,200 words is more than most buyers will read.`);
  if (g.title.length > 70) issues.push(`Title is ${g.title.length} characters; search results cut titles after about 70.`);
  if (g.description.length > 160) issues.push(`Description is ${g.description.length} characters; search results cut it after about 160.`);
  if (g.faqs.length === 0) issues.push("No FAQs. Two or three real buyer questions help readers and search engines.");
  if (g.keyTakeaways.length === 0) issues.push("No key takeaways.");
  const hype = HYPE.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(all));
  if (hype.length) issues.push(`Marketing words to remove: ${hype.join(", ")}.`);
  if (/!/.test(all)) issues.push("Contains exclamation marks.");
  const name = all.match(SUPPLIER_NAMES);
  if (name) issues.push(`Mentions "${name[0]}". Articles shouldn't name the site's supplier or any distributor.`);
  if (/\b(authori[sz]ed (distributor|dealer)|official partner)\b/i.test(all)) issues.push("Claims an authorized-distributor or partner relationship. Remove it.");
  return issues;
}
