import { describe, expect, it } from "vitest";
import { sampleProducts } from "@/data/products";
import { findMatch } from "@/lib/catalog-match";
import { similarity } from "@/server/content/generate";
import { matchLines } from "@/server/sourcing/match";
import { scoreLead } from "@/server/sourcing/score";

const base = {
  files: [],
  details: { urgency: "", equivalents: "", province: "", notes: "" },
  contact: { name: "A", company: "B", email: "buyer@example-panels.ca", phone: "", marketingOptIn: false, consentAt: "" },
  meta: { ipHash: "", userAgent: "", referer: "", spamSignals: [] as string[] },
};

describe("catalog matching", () => {
  it("finds exact part numbers, series and label words", () => {
    expect(findMatch(sampleProducts, "PT 2,5")?.exact).toBe(true);
    expect(findMatch(sampleProducts, "1492-J4")?.match.manufacturer).toBe("Allen-Bradley");
    expect(findMatch(sampleProducts, "push-in ground")?.match.fn).toBe("ground");
    expect(findMatch(sampleProducts, "XYZ-NOTHING-123")).toBeNull();
  });

  it("marks each RFQ line and suggests equivalents from other brands", () => {
    const m = matchLines(
      [
        { part: "UT 4", manufacturer: "", qty: 10, notes: "" },
        { part: "mystery part", manufacturer: "", qty: 1, notes: "" },
      ],
      sampleProducts,
    );
    expect(m[0].status).not.toBe("none");
    expect(m[0].equivalents.every((e) => e.manufacturer !== m[0].manufacturer)).toBe(true);
    expect(m[1].status).toBe("none");
  });
});

describe("lead scoring", () => {
  it("rates a detailed, urgent business request as hot", () => {
    const lines = Array.from({ length: 12 }, (_, i) => ({ part: i % 2 ? "UT 4" : "PT 2,5", manufacturer: "", qty: 50, notes: "" }));
    const s = scoreLead({ ...base, lines, details: { ...base.details, urgency: "Line down / ASAP" }, contact: { ...base.contact, phone: "555" } }, matchLines(lines, sampleProducts));
    expect(s.tier).toBe("hot");
    expect(s.score).toBeGreaterThanOrEqual(80);
    expect(s.reasons.length).toBeGreaterThan(3);
  });

  it("rates a small single-line business request as warm, not hot", () => {
    const lines = [{ part: "UT 4", manufacturer: "", qty: 10, notes: "" }];
    const s = scoreLead({ ...base, lines, files: [{ id: "f", name: "bom.csv", size: 1, type: "text/csv", key: "k" }], details: { ...base.details, urgency: "Within 1 week" } }, matchLines(lines, sampleProducts));
    expect(s.tier).toBe("warm");
  });

  it("rates a vague free-email request low and spam signals as spam", () => {
    const lines = [{ part: "something", manufacturer: "", qty: null, notes: "" }];
    expect(scoreLead({ ...base, lines, contact: { ...base.contact, email: "x@gmail.com" } }, matchLines(lines, sampleProducts)).tier).toBe("cold");
    expect(scoreLead({ ...base, lines, meta: { ...base.meta, spamSignals: ["links", "keywords"] } }, []).tier).toBe("spam");
  });
});

describe("duplicate content guard", () => {
  it("scores near-identical topics as similar and different topics as not", () => {
    expect(similarity("push in vs screw terminal blocks", "Push-in vs spring vs screw terminal blocks: which should you specify?")).toBeGreaterThanOrEqual(0.75);
    expect(similarity("din rail types", "How to size a terminal block")).toBeLessThan(0.75);
  });
});
