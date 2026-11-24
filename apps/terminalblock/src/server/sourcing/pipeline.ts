import "server-only";
import { z } from "zod";
import { getCatalog } from "@/data/catalog";
import { site } from "@/config/site";
import { AiUnavailableError, structured } from "@/server/ai/claude";
import { isFreeEmail } from "@/server/rfq/spam";
import type { Lead, LeadAnalysis, LineMatch } from "@/server/leads/types";
import { matchLines } from "./match";
import { scoreLead } from "./score";

const AnalysisSchema = z.object({
  summary: z.string().describe("Two or three plain sentences for the sourcing desk: what is being asked for and how ready the buyer seems"),
  buyerType: z.string().describe("Best guess, e.g. panel builder, OEM, maintenance / MRO, contractor, reseller, student or hobbyist, unclear"),
  intent: z.string().describe("e.g. production order, replacement / repair, prototype, budgetary quote, unclear"),
  flags: z.array(z.string()).describe("Short risk or attention notes: ambiguous parts, likely obsolete items, approval requirements, mismatched quantities, possible spam. Empty if none"),
  questions: z.array(z.string()).describe("Clarifying questions to ask the buyer before quoting. Empty if none needed"),
  supplierInquiry: z.string().describe("A concise, professional inquiry Proax can send to suppliers for availability and pricing. List each line with part number, manufacturer and quantity. Do not include the buyer's identity"),
});

const SYSTEM = `You are a sourcing analyst at ${site.operator}, a Canadian industrial automation distributor, reviewing a request for quote submitted through ${site.name}.
Work only from the request and catalog matches provided. Do not invent part numbers, specifications, prices or stock levels; when unsure, say so in flags or questions.
Catalog matches marked "likely" and all equivalents are unverified suggestions that a person must confirm.
Write in plain, concise Canadian English.`;

/** Facts sent to the AI. Deliberately excludes the buyer's name, email address and phone number. */
function promptFor(lead: Lead, matches: LineMatch[]) {
  const lines = lead.lines
    .map((l, i) => {
      const m = matches[i];
      const match = m && m.status !== "none" ? `catalog ${m.status}: ${m.manufacturer} ${m.partNumber} — ${m.description}` : "no catalog match";
      const eq = m?.equivalents.length ? `; possible equivalents: ${m.equivalents.map((e) => `${e.manufacturer} ${e.partNumber}`).join(", ")}` : "";
      return `${i + 1}. "${l.part}"${l.manufacturer ? ` (stated manufacturer: ${l.manufacturer})` : ""}, qty ${l.qty ?? "not given"}${l.notes ? `, notes: ${l.notes}` : ""} -> ${match}${eq}`;
    })
    .join("\n");
  return `Request ${lead.ref}
Buyer email type: ${isFreeEmail(lead.contact.email) ? "free webmail" : "company domain"}
Timing: ${lead.details.urgency || "not given"} | Equivalents acceptable: ${lead.details.equivalents || "not given"} | Ship to: ${lead.details.province || "not given"}
Attached files: ${lead.files.map((f) => f.name).join(", ") || "none"}

Lines:
${lines || "(no lines typed)"}

Buyer notes:
${lead.details.notes || "(none)"}`;
}

/** Rule-based fallback so the desk always gets something useful, even without AI. */
function rulesAnalysis(lead: Lead, matches: LineMatch[]): Omit<LeadAnalysis, "analyzedAt" | "by" | "score" | "matches"> {
  const unmatched = matches.filter((m) => m.status === "none").length;
  const noQty = lead.lines.filter((l) => !l.qty).length;
  const flags = [
    unmatched ? `${unmatched} line${unmatched > 1 ? "s" : ""} not found in the catalog` : "",
    matches.some((m) => m.status === "likely") ? "Some catalog matches are partial and need checking" : "",
    lead.files.length && !lead.lines.length ? "Request is file-only; review attachments" : "",
    ...lead.meta.spamSignals.map((s) => `Spam signal: ${s}`),
  ].filter(Boolean);
  const questions = [noQty ? `Confirm quantities for ${noQty} line${noQty > 1 ? "s" : ""}` : "", !lead.details.urgency ? "Ask when the parts are needed" : ""].filter(Boolean);
  const inquiryLines = lead.lines.map((l, i) => {
    const m = matches[i];
    const pn = m?.status === "exact" ? `${m.manufacturer} ${m.partNumber}` : `${l.manufacturer ? l.manufacturer + " " : ""}${l.part}`;
    return `- ${pn}${l.qty ? `, qty ${l.qty}` : ", qty TBC"}`;
  });
  return {
    summary: `${lead.lines.length} line${lead.lines.length === 1 ? "" : "s"} requested${lead.files.length ? ` with ${lead.files.length} attachment${lead.files.length > 1 ? "s" : ""}` : ""}. ${matches.filter((m) => m.status === "exact").length} matched exactly in the catalog.`,
    buyerType: "unclear",
    intent: lead.details.urgency.toLowerCase().includes("budget") ? "budgetary quote" : "unclear",
    flags,
    questions,
    supplierInquiry: `Hello,\n\nPlease quote availability, lead time and pricing for the following${lead.details.province ? ` (delivery to ${lead.details.province})` : ""}:\n\n${inquiryLines.join("\n") || "- see attached list"}\n\n${lead.details.equivalents === "Exact part only" ? "Exact parts only, no substitutes." : "Equivalent parts may be offered; please state the alternative clearly."}\n\nThank you,\nProax sourcing desk`,
  };
}

export async function analyzeLead(lead: Lead): Promise<LeadAnalysis> {
  const matches = matchLines(lead.lines, getCatalog().items);
  const score = scoreLead(lead, matches);
  const base = { analyzedAt: new Date().toISOString(), score, matches };
  try {
    const ai = await structured(AnalysisSchema, { system: SYSTEM, content: promptFor(lead, matches), effort: "medium", maxTokens: 8000 });
    return { ...base, by: "ai", ...ai };
  } catch (error) {
    if (!(error instanceof AiUnavailableError)) console.error("Lead analysis failed:", error instanceof Error ? error.message : error);
    return { ...base, by: "rules", ...rulesAnalysis(lead, matches) };
  }
}
