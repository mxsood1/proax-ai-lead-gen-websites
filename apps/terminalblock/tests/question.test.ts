import { describe, expect, it } from "vitest";
import { makeRef, safeFileName } from "@/server/rfq/ref";
import { isFreeEmail, rateLimited, spamSignals } from "@/server/rfq/spam";
import { comparisonSchema, questionSchema, scoreQuestion } from "@/server/leads/capture";
import { comparisonId, downloadToken, verifyDownloadToken } from "@/server/downloads";
import { renderComparisonPdf } from "@/server/compare-pdf";
import { allPairs, brandGroups, brands, compareCategories, pairSlug, parsePair } from "@/data/brands";

const valid = {
  question: "Which push-in block replaces a Phoenix Contact UK 5 screw block on an existing rail?",
  email: "Engineer@Example-Panels.ca",
  consent: true,
  page: "/compare",
  website: "",
  startedAt: 0,
};

describe("question form validation", () => {
  it("accepts a normal question and normalizes the email", () => {
    const q = questionSchema.parse(valid);
    expect(q.email).toBe("engineer@example-panels.ca");
    expect(q.name).toBe("");
    expect(q.company).toBe("");
  });

  it("requires a real question, a valid email and consent", () => {
    const r = questionSchema.safeParse({ ...valid, question: "help", email: "nope", consent: false });
    expect(r.success).toBe(false);
    const messages = r.success ? "" : r.error.issues.map((i) => i.message).join(" | ");
    expect(messages).toMatch(/more detail/);
    expect(messages).toMatch(/valid email/);
    expect(messages).toMatch(/reply to you/);
  });

  it("rejects unexpected fields and oversized input", () => {
    expect(questionSchema.safeParse({ ...valid, admin: true }).success).toBe(false);
    expect(questionSchema.safeParse({ ...valid, question: "x".repeat(3001) }).success).toBe(false);
  });
});

describe("spam and scoring", () => {
  it("flags link-stuffed and keyword spam", () => {
    expect(spamSignals("Cheap backlinks at https://a.example and https://b.example").join()).toMatch(/links|spam keywords/);
    expect(spamSignals(valid.question)).toEqual([]);
  });

  it("scores a detailed question from a company address above a vague one", () => {
    const good = scoreQuestion({ email: "a@example-panels.ca", role: "Buyer / purchasing", question: `${valid.question} We have 40 of them on a machine.` }, []);
    const vague = scoreQuestion({ email: "a@gmail.com", role: "", question: "Which brand is good?" }, []);
    expect(good.score).toBeGreaterThan(vague.score);
    expect(scoreQuestion({ email: "a@example.ca", role: "", question: "spam" }, ["spam keywords"]).tier).toBe("spam");
  });

  it("rate-limits repeated submissions", () => {
    const key = `test-${Math.random()}`;
    const results = Array.from({ length: 6 }, (_, i) => rateLimited(key, 5, 60_000, 1000 + i));
    expect(results).toEqual([false, false, false, false, false, true]);
  });

  it("recognizes free email providers", () => {
    expect(isFreeEmail("someone@gmail.com")).toBe(true);
    expect(isFreeEmail("buyer@example-panels.ca")).toBe(false);
  });
});

describe("brand comparison data", () => {
  it("has one canonical page per pair", () => {
    expect(pairSlug("weidmuller", "phoenix-contact")).toBe("phoenix-contact-vs-weidmuller");
    expect(parsePair("phoenix-contact-vs-weidmuller")?.map((b) => b.name)).toEqual(["Phoenix Contact", "Weidmüller"]);
    expect(parsePair("phoenix-contact-vs-phoenix-contact")).toBeNull();
    expect(parsePair("acme-vs-wago")).toBeNull();
    expect(allPairs()).toHaveLength((brands.length * (brands.length - 1)) / 2);
  });

  it("gives every brand both strengths and things to check, and only known categories", () => {
    const ids = new Set(compareCategories.map((c) => c.id));
    for (const b of brands) {
      expect(b.strengths.length, b.name).toBeGreaterThan(0);
      expect(b.check.length, b.name).toBeGreaterThan(0);
      for (const key of Object.keys(b.ranges)) expect(ids.has(key), `${b.name}: ${key}`).toBe(true);
    }
  });

  it("puts every brand in exactly one picker group", () => {
    const grouped = brandGroups.flatMap((g) => g.slugs);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual(brands.map((b) => b.slug).sort());
  });

  it("only links to the shop over https on proax.ca", async () => {
    const { buyLinks } = await import("@/data/buy-links");
    const links = [...brands.map((b) => b.buy?.href), ...Object.values(buyLinks).map((l) => l?.href)].filter(Boolean) as string[];
    expect(links.length).toBeGreaterThan(5);
    for (const href of links) expect(href).toMatch(/^https:\/\/proax\.ca\/en\//);
  });

  it("never claims a brand is best", () => {
    const text = JSON.stringify(brands);
    expect(text).not.toMatch(/\b(best|number one|#1|superior|authori[sz]ed distributor)\b/i);
  });
});

describe("comparison PDF", () => {
  it("validates the email form for a comparison", () => {
    const base = { email: "a@example-panels.ca", consent: true, pair: "phoenix-contact-vs-weidmuller" };
    expect(comparisonSchema.parse(base).company).toBe("");
    expect(comparisonSchema.safeParse({ ...base, pair: "../etc/passwd" }).success).toBe(false);
    expect(comparisonSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });

  it("signs download links per comparison", () => {
    const id = comparisonId("phoenix-contact-vs-weidmuller");
    const token = downloadToken(id, 60_000);
    expect(verifyDownloadToken(token, id)).toBe(true);
    expect(verifyDownloadToken(token, comparisonId("phoenix-contact-vs-wago"))).toBe(false);
    expect(verifyDownloadToken(downloadToken(id, -1), id)).toBe(false);
  });

  it("builds the PDF from the fixed template for any pair (no AI)", async () => {
    const [a, b] = parsePair("phoenix-contact-vs-weidmuller")!;
    const when = new Date("2026-11-27T12:00:00Z");
    const one = await renderComparisonPdf(a, b, when);
    expect(one.subarray(0, 5).toString()).toBe("%PDF-");
    expect(one.length).toBeGreaterThan(3000);
    // every pair renders, including ones with little data
    for (const [x, y] of allPairs().slice(0, 25)) expect((await renderComparisonPdf(x, y, when)).subarray(0, 5).toString()).toBe("%PDF-");
  });
});

describe("references and file names", () => {
  it("makes readable, unambiguous references", () => {
    expect(makeRef("TB", new Date("2026-11-13T12:00:00Z"))).toMatch(/^RFQ-TB-261113-[2-9A-HJ-NP-Z]{4}$/);
  });

  it("neutralizes path tricks in file names", () => {
    expect(safeFileName("../../etc/passwd")).not.toContain("/");
    expect(safeFileName("...")).toBe("file");
  });
});
