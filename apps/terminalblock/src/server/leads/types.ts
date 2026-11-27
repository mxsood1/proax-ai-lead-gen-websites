export const LEAD_STATUSES = ["new", "reviewing", "answered", "sourcing", "quoted", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadLine = {
  part: string;
  manufacturer: string;
  qty: number | null;
  notes: string;
};

export type LeadFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  /** storage key — local relative path or bucket object path */
  key: string;
};

export type LineMatch = {
  line: number;
  status: "exact" | "likely" | "none";
  partNumber: string | null;
  manufacturer: string | null;
  description: string | null;
  equivalents: { partNumber: string; manufacturer: string; description: string }[];
};

export type LeadScore = {
  score: number; // 0–100
  tier: "hot" | "warm" | "cold" | "spam";
  reasons: string[];
};

export type LeadAnalysis = {
  analyzedAt: string;
  by: "ai" | "rules";
  score: LeadScore;
  matches: LineMatch[];
  summary: string;
  buyerType: string;
  intent: string;
  flags: string[];
  questions: string[];
  supplierInquiry: string;
};

export type LeadEvent = { at: string; type: string; note?: string };

/**
 * How the lead came in: a question from the "Ask us" form, or a guide download.
 * "rfq" and "list" are kept only so older leads still display.
 */
export const LEAD_KINDS = ["question", "comparison", "guide", "rfq", "list"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];
export const LEAD_KIND_LABEL: Record<LeadKind, string> = {
  question: "Question",
  comparison: "Comparison PDF",
  guide: "Guide download (old)",
  rfq: "Quote request (old form)",
  list: "Emailed parts list (old)",
};

export type Lead = {
  id: string;
  /** Missing on older leads, which are all quote requests */
  kind?: LeadKind;
  ref: string;
  site: string;
  createdAt: string;
  status: LeadStatus;
  lines: LeadLine[];
  files: LeadFile[];
  details: {
    urgency: string;
    equivalents: string;
    province: string;
    notes: string;
  };
  contact: {
    name: string;
    company: string;
    email: string;
    phone: string;
    /** Buyer, engineer, maintenance or other (optional) */
    role?: string;
    marketingOptIn: boolean;
    consentAt: string;
  };
  meta: {
    ipHash: string;
    userAgent: string;
    referer: string;
    spamSignals: string[];
  };
  analysis: LeadAnalysis | null;
  events: LeadEvent[];
};

export type LeadSummary = Pick<Lead, "id" | "ref" | "createdAt" | "status" | "site"> & {
  kind: LeadKind;
  company: string;
  lineCount: number;
  fileCount: number;
  urgency: string;
  tier: LeadScore["tier"] | null;
  score: number | null;
  /** Start of the question (questions only) */
  excerpt: string;
  email: string;
};

export function summarize(lead: Lead): LeadSummary {
  return {
    id: lead.id,
    kind: lead.kind ?? "rfq",
    ref: lead.ref,
    createdAt: lead.createdAt,
    status: lead.status,
    site: lead.site,
    company: lead.contact.company,
    lineCount: lead.lines.length,
    fileCount: lead.files.length,
    urgency: lead.details.urgency,
    tier: lead.analysis?.score.tier ?? null,
    score: lead.analysis?.score.score ?? null,
    excerpt: lead.kind === "question" ? lead.details.notes.slice(0, 140) : "",
    email: lead.contact.email,
  };
}
