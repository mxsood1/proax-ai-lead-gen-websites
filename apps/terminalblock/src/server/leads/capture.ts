import "server-only";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { site } from "@/config/site";
import { config } from "@/server/config";
import { makeRef, newId } from "@/server/rfq/ref";
import { hashIp, isFreeEmail } from "@/server/rfq/spam";
import { clientIp } from "@/server/http";
import { ROLES } from "@/lib/lead-roles";
import type { Lead, LeadKind, LeadLine, LeadScore } from "./types";

/**
 * Light-weight lead capture used by the guide download and "email me this list".
 * Same protections as the RFQ form: honeypot, timing check, consent, length limits.
 */
export { ROLES };

const text = (max: number) => z.string().trim().max(max);

export const captureSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
    name: text(120).default(""),
    company: text(160).min(2, "Company is required."),
    role: z.enum(ROLES).or(z.literal("")).default(""),
    marketingOptIn: z.boolean().default(false),
    consent: z.literal(true, { error: "Please agree so we can send it to you." }),
    website: text(200).default(""), // honeypot
    startedAt: z.number().int().nonnegative().default(0),
  })
  .strict();

export type Capture = z.infer<typeof captureSchema>;

/** Bots: honeypot filled, or the form sent within 2 seconds of opening. */
export function isBot(c: Capture, now = Date.now()) {
  return Boolean(c.website) || (c.startedAt > 0 && now - c.startedAt < 2000);
}

/** Transparent score for contact-only leads (no quote yet). Never marks a real person as spam. */
export function scoreCapture(kind: LeadKind, c: Pick<Capture, "email" | "role" | "marketingOptIn">, lineCount: number): LeadScore {
  let score = 20;
  const reasons: string[] = [];
  const add = (pts: number, why: string) => {
    score += pts;
    reasons.push(`${pts > 0 ? "+" : ""}${pts} ${why}`);
  };
  if (isFreeEmail(c.email)) add(-5, "free email address");
  else add(15, "company email domain");
  if (c.role === "Buyer / purchasing") add(10, "buyer");
  else if (c.role === "Engineer / designer" || c.role === "Maintenance / technician") add(5, c.role.split(" /")[0].toLowerCase());
  if (c.marketingOptIn) add(5, "opted in to updates");
  if (kind === "list") {
    if (lineCount >= 5) add(15, `${lineCount} parts on the list`);
    else if (lineCount > 0) add(8, `${lineCount} part${lineCount > 1 ? "s" : ""} on the list`);
  }
  score = Math.max(0, Math.min(100, score));
  return { score, tier: score >= 80 ? "hot" : score >= 50 ? "warm" : "cold", reasons };
}

export function buildCaptureLead(req: NextRequest, kind: Exclude<LeadKind, "rfq">, c: Capture, lines: LeadLine[], note: string): Lead {
  const now = new Date().toISOString();
  const score = scoreCapture(kind, c, lines.length);
  return {
    id: newId(),
    kind,
    ref: makeRef(site.rfqPrefix),
    site: config.siteId,
    createdAt: now,
    status: "new",
    lines,
    files: [],
    details: { urgency: "", equivalents: "", province: "", notes: note },
    contact: { name: c.name, company: c.company, email: c.email, phone: "", role: c.role || undefined, marketingOptIn: c.marketingOptIn, consentAt: now },
    meta: {
      ipHash: hashIp(clientIp(req)),
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200),
      referer: (req.headers.get("referer") ?? "").slice(0, 300),
      spamSignals: [],
    },
    analysis: {
      analyzedAt: now,
      by: "rules",
      score,
      matches: [],
      summary: note,
      buyerType: c.role || "unknown",
      intent: kind === "list" ? "researching parts, list saved" : "researching, downloaded the guide",
      flags: [],
      questions: [],
      supplierInquiry: "",
    },
    events: [{ at: now, type: "received", note }],
  };
}
