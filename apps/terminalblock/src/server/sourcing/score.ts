import type { Lead, LeadScore, LineMatch } from "@/server/leads/types";
import { isFreeEmail } from "@/server/rfq/spam";

/**
 * Transparent, rule-based lead score (0–100). Every point has a reason the
 * sourcing desk can read, so the score is explainable without AI.
 */
export function scoreLead(lead: Pick<Lead, "lines" | "files" | "details" | "contact" | "meta">, matches: LineMatch[]): LeadScore {
  let score = 20;
  const reasons: string[] = [];
  const add = (pts: number, why: string) => {
    score += pts;
    reasons.push(`${pts > 0 ? "+" : ""}${pts} ${why}`);
  };

  if (isFreeEmail(lead.contact.email)) add(-5, "free email address");
  else add(15, "company email domain");

  if (lead.contact.phone) add(5, "phone number given");

  const n = lead.lines.length;
  if (n >= 10) add(20, `${n} lines (BOM-sized request)`);
  else if (n >= 3) add(15, `${n} lines`);
  else if (n === 2) add(8, "2 lines");
  else if (n === 1) add(5, "1 line");

  if (n > 0) {
    const withQty = lead.lines.filter((l) => l.qty).length;
    if (withQty) add(Math.round((withQty / n) * 10), `quantities on ${withQty}/${n} lines`);
    const totalQty = lead.lines.reduce((s, l) => s + (l.qty ?? 0), 0);
    if (totalQty >= 100) add(10, `${totalQty.toLocaleString("en-CA")} units in total`);

    const matched = matches.filter((m) => m.status !== "none").length;
    if (matched) add(Math.round((matched / n) * 10), `${matched}/${n} lines found in the catalog`);
  }

  const urgency = lead.details.urgency.toLowerCase();
  if (urgency.includes("line down") || urgency.includes("asap")) add(15, "line down / ASAP");
  else if (urgency.includes("1 week")) add(10, "needed within a week");
  else if (urgency.includes("2–4") || urgency.includes("2-4")) add(5, "needed in 2–4 weeks");
  else if (urgency.includes("budget")) add(-5, "budgetary quote only");

  if (lead.files.length) add(5, `${lead.files.length} file${lead.files.length > 1 ? "s" : ""} attached`);

  for (const s of lead.meta.spamSignals) add(-25, `spam signal: ${s}`);

  score = Math.max(0, Math.min(100, score));
  const tier: LeadScore["tier"] =
    lead.meta.spamSignals.length >= 2 || score < 15 ? "spam" : score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";
  return { score, tier, reasons };
}
