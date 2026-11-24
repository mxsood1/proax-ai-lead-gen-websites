import { describe, expect, it } from "vitest";
import { makeRef, safeFileName } from "@/server/rfq/ref";
import { submissionSchema } from "@/server/rfq/schema";
import { checkSpam, isFreeEmail, rateLimited } from "@/server/rfq/spam";

const valid = {
  lines: [{ part: "3044102", manufacturer: "Phoenix Contact", qty: "120", notes: "" }],
  details: { urgency: "Within 1 week", equivalents: "Equivalents welcome", province: "Ontario", notes: "" },
  contact: { name: "Test Buyer", company: "Example Panels", email: "Buyer@Example.com", phone: "", marketingOptIn: false, consent: true },
  website: "",
  startedAt: 0,
};

describe("submission validation", () => {
  it("accepts a normal request and normalizes fields", () => {
    const r = submissionSchema.parse(valid);
    expect(r.lines[0].qty).toBe(120);
    expect(r.contact.email).toBe("buyer@example.com");
  });

  it("requires consent, a real email and a company", () => {
    const r = submissionSchema.safeParse({ ...valid, contact: { ...valid.contact, consent: false, email: "nope", company: "" } });
    expect(r.success).toBe(false);
    const messages = r.success ? [] : r.error.issues.map((i) => i.message).join(" | ");
    expect(messages).toMatch(/contact you/);
    expect(messages).toMatch(/valid email/);
    expect(messages).toMatch(/Company/);
  });

  it("rejects unexpected fields and oversized input", () => {
    expect(submissionSchema.safeParse({ ...valid, admin: true }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...valid, lines: Array.from({ length: 501 }, () => valid.lines[0]) }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...valid, details: { ...valid.details, notes: "x".repeat(4001) } }).success).toBe(false);
  });

  it("treats an empty quantity as unknown", () => {
    expect(submissionSchema.parse({ ...valid, lines: [{ ...valid.lines[0], qty: "" }] }).lines[0].qty).toBeNull();
  });
});

describe("spam protection", () => {
  const parsed = submissionSchema.parse(valid);

  it("blocks the honeypot and instant submissions", () => {
    expect(checkSpam({ ...parsed, website: "http://spam.example" }).block).toContain("honeypot");
    expect(checkSpam({ ...parsed, startedAt: 1000 }, 1500).block).toContain("submitted too fast");
    expect(checkSpam({ ...parsed, startedAt: 1000 }, 20_000).block).toEqual([]);
  });

  it("flags link-stuffed messages without blocking them", () => {
    const s = checkSpam({ ...parsed, details: { ...parsed.details, notes: "https://a https://b https://c" } });
    expect(s.block).toEqual([]);
    expect(s.signals.join()).toMatch(/links/);
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

describe("references and file names", () => {
  it("makes readable, unambiguous references", () => {
    expect(makeRef("TB", new Date("2026-11-13T12:00:00Z"))).toMatch(/^RFQ-TB-261113-[2-9A-HJ-NP-Z]{4}$/);
  });

  it("neutralizes path tricks in uploaded file names", () => {
    expect(safeFileName("../../etc/passwd")).not.toContain("/");
    expect(safeFileName("..\\..\\boot.ini")).not.toMatch(/[\\/]/);
    expect(safeFileName("...")).toBe("file");
    expect(safeFileName("BOM März.xlsx")).toBe("BOM_Marz.xlsx");
  });
});
