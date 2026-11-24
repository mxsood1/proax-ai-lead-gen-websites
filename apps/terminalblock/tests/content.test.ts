import { describe, expect, it } from "vitest";
import type { Guide, GuideBlock } from "@/data/guides";
import { blocksToText, faqsToText, linesToList, textToBlocks, textToFaqs } from "@/server/content/markdown";
import { pickNextTopic, qualityIssues, similarity, wordCount } from "@/server/content/topics";
import { cronAuthorized } from "@/server/auth/cron";
import { uniqueSlug } from "@/server/content/generate";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
const guide = (over: Partial<Guide> = {}): Guide => ({
  slug: "test-guide",
  title: "How to choose a fuse terminal block",
  shortTitle: "Fuse blocks",
  description: "What to check when choosing a fuse terminal block for control circuits",
  category: "Selection",
  readMinutes: 3,
  updated: "2026-11-24",
  keyTakeaways: ["Match the fuse size"],
  body: [{ type: "p", text: words(500) }],
  faqs: [{ q: "Do I need an LED?", a: "Only if you want a blown-fuse indicator." }],
  ...over,
});

describe("next topic", () => {
  const keywords = [
    { keyword: "covered one", priority: 1, coveredBy: "x" },
    { keyword: "terminal block colours meaning", priority: 2 },
    { keyword: "do you need ferrules for terminal blocks", priority: 1 },
    { keyword: "din rail types 35 x 7.5 vs 35 x 15", priority: 1 },
  ];

  it("takes the highest priority uncovered, undrafted topic in file order", () => {
    expect(pickNextTopic(keywords, [], [])?.keyword).toBe("do you need ferrules for terminal blocks");
  });

  it("skips topics with a live draft but retries rejected ones", () => {
    const drafts = [{ keyword: "do you need ferrules for terminal blocks", status: "draft" }];
    expect(pickNextTopic(keywords, drafts, [])?.keyword).toBe("din rail types 35 x 7.5 vs 35 x 15");
    expect(pickNextTopic(keywords, [{ ...drafts[0], status: "rejected" }], [])?.keyword).toBe("do you need ferrules for terminal blocks");
  });

  it("skips near-duplicates of existing titles", () => {
    expect(pickNextTopic(keywords, [], ["Ferrules for terminal blocks: do you need them?"])?.keyword).toBe("din rail types 35 x 7.5 vs 35 x 15");
    expect(similarity("terminal block colours", "Terminal block colours explained")).toBe(1);
  });

  it("returns null when nothing is left", () => {
    expect(pickNextTopic([{ keyword: "a b c", priority: 1, coveredBy: "x" }], [], [])).toBeNull();
  });
});

describe("quality checks", () => {
  it("passes a clean article", () => {
    expect(qualityIssues(guide())).toEqual([]);
    expect(wordCount(guide())).toBe(500);
  });

  it("flags length, hype, exclamation marks and supplier names", () => {
    const issues = qualityIssues(
      guide({
        title: "x".repeat(80),
        body: [{ type: "p", text: "A seamless way to wire! Ask Proax for stock." }],
        faqs: [],
      }),
    );
    const text = issues.join(" | ");
    expect(text).toMatch(/Short article/);
    expect(text).toMatch(/Title is 80/);
    expect(text).toMatch(/seamless/);
    expect(text).toMatch(/exclamation/);
    expect(text).toMatch(/Proax/);
    expect(text).toMatch(/No FAQs/);
  });

  it("flags authorized-distributor claims", () => {
    expect(qualityIssues(guide({ keyTakeaways: ["Buy from an authorized distributor"] })).join(" ")).toMatch(/authorized-distributor/);
  });
});

describe("article text format", () => {
  const blocks: GuideBlock[] = [
    { type: "p", text: "Intro paragraph." },
    { type: "h2", text: "Sizes" },
    { type: "ul", items: ["5 × 20 mm", "1/4 × 1-1/4 in"] },
    { type: "h3", text: "Indicators" },
    { type: "callout", title: "Sourcing tip", text: "Order spare fuses with the blocks." },
    { type: "table", head: ["Format", "Typical use"], rows: [["5 × 20 mm", "Control | signal"], ["10 × 38 mm", "Power"]] },
    { type: "p", text: "Closing paragraph." },
  ];

  it("round-trips every block type", () => {
    expect(textToBlocks(blocksToText(blocks))).toEqual(blocks);
  });

  it("joins wrapped paragraph lines and accepts tables without a divider row", () => {
    expect(textToBlocks("First line\nsecond line\n\n| a | b |\n| 1 | 2 |")).toEqual([
      { type: "p", text: "First line second line" },
      { type: "table", head: ["a", "b"], rows: [["1", "2"]] },
    ]);
  });

  it("parses FAQs and lists", () => {
    const faqs = [
      { q: "One?", a: "Yes." },
      { q: "Two?", a: "No, because it continues." },
    ];
    expect(textToFaqs(faqsToText(faqs))).toEqual(faqs);
    expect(textToFaqs("Q: Two?\nA: No, because\nit continues.")).toEqual([faqs[1]]);
    expect(textToFaqs("Q: no answer")).toEqual([]);
    expect(linesToList("- one\n\n* two\nthree")).toEqual(["one", "two", "three"]);
  });
});

describe("cron auth and slugs", () => {
  const secret = "a-long-random-secret-value";
  it("accepts only the exact bearer secret", () => {
    expect(cronAuthorized(`Bearer ${secret}`, secret)).toBe(true);
    expect(cronAuthorized(`Bearer ${secret}x`, secret)).toBe(false);
    expect(cronAuthorized(secret, secret)).toBe(false);
    expect(cronAuthorized(null, secret)).toBe(false);
    expect(cronAuthorized("Bearer ", "")).toBe(false);
    expect(cronAuthorized("Bearer short", "short")).toBe(false);
  });

  it("makes slugs safe and unique", () => {
    expect(uniqueSlug("Fuse Terminal Blocks!", new Set())).toBe("fuse-terminal-blocks");
    expect(uniqueSlug("fuse terminal blocks", new Set(["fuse-terminal-blocks", "fuse-terminal-blocks-2"]))).toBe("fuse-terminal-blocks-3");
  });
});
