/**
 * A simple text format so reviewers can edit articles in a plain textarea
 * instead of JSON. Pure functions (no I/O), round-trip safe for every block type.
 *
 *   ## Heading            → h2
 *   ### Subheading        → h3
 *   - item                → bullet list (consecutive lines)
 *   > **Title** text      → callout box
 *   | a | b |             → table (first row is the header; a |---| row is optional)
 *   ![Caption](push-in, ground) → one to three product images in a row (ids from src/data/photos.json)
 *   anything else         → paragraph (blank line between paragraphs)
 */
import type { GuideBlock } from "@/data/guides";

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));
const cell = (s: string) => s.replace(/\|/g, "\\|");
const isRule = (line: string) => /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");

export function blocksToText(blocks: GuideBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `## ${b.text}`;
        case "h3":
          return `### ${b.text}`;
        case "p":
          return b.text;
        case "ul":
          return b.items.map((i) => `- ${i}`).join("\n");
        case "callout":
          return `> **${b.title}** ${b.text}`;
        case "table":
          return [`| ${b.head.map(cell).join(" | ")} |`, `|${b.head.map(() => "---").join("|")}|`, ...b.rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
        case "image":
          return `![${(b.caption ?? "").replace(/[[\]]/g, "")}](${b.photos.join(", ")})`;
      }
    })
    .join("\n\n");
}

export function textToBlocks(text: string): GuideBlock[] {
  const blocks: GuideBlock[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    const img = line.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (img) {
      const photos = img[2]
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[a-z0-9-]{1,60}$/.test(s))
        .slice(0, 3);
      if (photos.length) blocks.push(img[1].trim() ? { type: "image", photos, caption: img[1].trim() } : { type: "image", photos });
      i++;
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(lines[i++].trim().slice(2).trim());
      blocks.push({ type: "ul", items });
    } else if (line.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) parts.push(lines[i++].trim().replace(/^>\s?/, ""));
      const joined = parts.join(" ").trim();
      const m = joined.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
      blocks.push(m ? { type: "callout", title: m[1].trim(), text: m[2].trim() } : { type: "callout", title: "Note", text: joined });
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        if (!isRule(lines[i])) rows.push(cells(lines[i]));
        i++;
      }
      const [head = [], ...body] = rows;
      blocks.push({ type: "table", head, rows: body });
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |[-*] |>|\||!\[)/.test(lines[i].trim())) parts.push(lines[i++].trim());
      blocks.push({ type: "p", text: parts.join(" ") });
    }
  }
  return blocks;
}

/* FAQs: "Q: question" then "A: answer" (the answer may continue on following lines) */

export function faqsToText(faqs: { q: string; a: string }[]) {
  return faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
}

export function textToFaqs(text: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  let cur: { q: string; a: string } | null = null;
  let field: "q" | "a" = "q";
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^q:/i.test(line)) {
      if (cur && cur.q && cur.a) out.push(cur);
      cur = { q: line.slice(2).trim(), a: "" };
      field = "q";
    } else if (/^a:/i.test(line) && cur) {
      cur.a = line.slice(2).trim();
      field = "a";
    } else if (cur) {
      cur[field] = `${cur[field]} ${line}`.trim();
    }
  }
  if (cur && cur.q && cur.a) out.push(cur);
  return out;
}

export const linesToList = (text: string) =>
  text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim().replace(/^[-*]\s+/, ""))
    .filter(Boolean);
