import { describe, expect, it } from "vitest";
import { captureSchema, isBot, scoreCapture } from "@/server/leads/capture";
import { downloadToken, verifyDownloadToken } from "@/server/downloads";

const valid = { email: "Pat@Acme-Controls.ca", company: "Acme Controls", consent: true as const, startedAt: 1 };

describe("lead capture form", () => {
  it("accepts a minimal valid form and normalises the email", () => {
    const r = captureSchema.parse(valid);
    expect(r.email).toBe("pat@acme-controls.ca");
    expect(r.role).toBe("");
    expect(r.marketingOptIn).toBe(false);
  });

  it("requires consent, a real email and a company", () => {
    expect(captureSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(captureSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(captureSchema.safeParse({ ...valid, company: "" }).success).toBe(false);
  });

  it("rejects unknown fields and unknown roles", () => {
    expect(captureSchema.safeParse({ ...valid, admin: true }).success).toBe(false);
    expect(captureSchema.safeParse({ ...valid, role: "CEO" }).success).toBe(false);
  });

  it("treats a filled honeypot or an instant submit as a bot", () => {
    const c = captureSchema.parse(valid);
    expect(isBot({ ...c, website: "spam.example" })).toBe(true);
    expect(isBot({ ...c, startedAt: 1000 }, 1500)).toBe(true);
    expect(isBot({ ...c, startedAt: 1000 }, 10_000)).toBe(false);
  });
});

describe("contact lead score", () => {
  it("ranks a buyer with a company email and a parts list above a free-email download", () => {
    const strong = scoreCapture("list", { email: "buyer@plant.ca", role: "Buyer / purchasing", marketingOptIn: true }, 6);
    const weak = scoreCapture("guide", { email: "someone@gmail.com", role: "", marketingOptIn: false }, 0);
    expect(strong.score).toBeGreaterThan(weak.score);
    // "hot" is kept for people who ask for a quote; a strong saved list is "warm"
    expect(strong.tier).toBe("warm");
    expect(weak.tier).toBe("cold");
  });

  it("never marks a real contact as spam", () => {
    const s = scoreCapture("guide", { email: "x@gmail.com", role: "", marketingOptIn: false }, 0);
    expect(s.tier).not.toBe("spam");
  });
});

describe("guide download links", () => {
  it("accepts a fresh link for the right guide only", () => {
    const t = downloadToken("bom-checklist", 60_000);
    expect(verifyDownloadToken(t, "bom-checklist")).toBe(true);
    expect(verifyDownloadToken(t, "other-guide")).toBe(false);
  });

  it("rejects expired and tampered links", () => {
    const t = downloadToken("bom-checklist", 60_000);
    expect(verifyDownloadToken(t, "bom-checklist", Date.now() + 120_000)).toBe(false);
    const [id, exp, sig] = t.split(".");
    expect(verifyDownloadToken(`${id}.${Number(exp) + 999_999}.${sig}`, "bom-checklist")).toBe(false);
    expect(verifyDownloadToken("garbage", "bom-checklist")).toBe(false);
  });
});
