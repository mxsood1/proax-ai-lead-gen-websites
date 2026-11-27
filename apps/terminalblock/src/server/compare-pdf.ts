import "server-only";
import PDFDocument from "pdfkit";
import { site } from "@/config/site";
import { compareCategories, pairSlug, type Brand } from "@/data/brands";

/**
 * Builds the "A vs B" comparison PDF from a fixed template, using the same
 * brand data as the comparison page. No AI: the same input always gives the
 * same document. Letter size, standard PDF fonts (no font files to ship).
 */

const INK = "#1b1915";
const MUTED = "#5e554a";
const STEEL = "#7b7266";
const LINE = "#e0d9cc";
const PAPER2 = "#eee9df";
const ACCENT = "#c2410c";
const OK = "#16a34a";

type Row = { label: string; a: string; b: string };
type Section = { title: string; note?: string; rows: Row[] };

const bullets = (items: string[]) => items.map((s) => `• ${s}`).join("\n");

function sections(a: Brand, b: Brand): Section[] {
  const part = (pick: (p: NonNullable<Brand["part"]>) => string) => (x: Brand) => (x.part ? pick(x.part) : "");
  const rows = (list: [string, (x: Brand) => string][]) =>
    list.map(([label, get]) => ({ label, a: get(a), b: get(b) })).filter((r) => r.a || r.b);
  const sameKind = a.part && b.part && a.part.kind === b.part.kind;
  return [
    { title: "The company", rows: rows([["Head office", (x) => x.hq], ["Terminal block range", (x) => x.summary]]) },
    {
      title: "Range by type",
      note: "The product family to look for in each catalogue",
      rows: rows(compareCategories.map((c) => [c.label, (x: Brand) => x.ranges[c.id] ?? ""] as [string, (x: Brand) => string])),
    },
    {
      title: "A similar part, side by side",
      note: sameKind ? a.part!.kind : "Each brand's closest comparable part",
      rows: rows([
        ["Part", part((p) => p.name)],
        ["Order number", part((p) => p.number)],
        ["Connection", part((p) => p.connection)],
        ["Width or pitch", part((p) => p.width)],
        ["Conductor range", part((p) => p.conductor)],
        ["Rating (IEC)", part((p) => p.iec)],
        ["Rating (UL / CSA)", part((p) => p.ul)],
        ["Approvals", part((p) => p.approvals)],
      ]),
    },
    {
      title: "Strengths and things to check",
      rows: rows([
        ["Strengths", (x) => bullets(x.strengths)],
        ["Things to check", (x) => bullets(x.check)],
      ]),
    },
  ].filter((s) => s.rows.length > 0);
}

export function comparisonFileName(a: Brand, b: Brand) {
  return `${pairSlug(a.slug, b.slug)}-terminal-blocks.pdf`;
}

export function renderComparisonPdf(a: Brand, b: Brand, now = new Date()): Promise<Buffer> {
  const M = 48;
  const doc = new PDFDocument({
    size: "LETTER",
    bufferPages: true, // so page footers ("page 1 of 2") can be added at the end
    margins: { top: M, bottom: M, left: M, right: M },
    info: { Title: `${a.name} vs ${b.name} terminal blocks`, Author: site.name, Subject: "Terminal block brand comparison" },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const W = doc.page.width - M * 2;
  const bottom = () => doc.page.height - M - 24; // leave room for the page footer
  const col = [Math.round(W * 0.26), Math.round(W * 0.37), W - Math.round(W * 0.26) - Math.round(W * 0.37)];
  const pad = 6;
  const dateText = now.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" });

  // ---- header
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("TerminalBlock", M, M, { continued: true }).fillColor(ACCENT).text(".ca");
  doc.font("Helvetica").fontSize(9).fillColor(STEEL).text(`Brand comparison · ${dateText}`, M, M, { width: W, align: "right" });
  doc.moveDown(1.6);
  doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text(`${a.name} vs ${b.name} terminal blocks`, M, doc.y, { width: W });
  doc.moveDown(0.4);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(MUTED)
    .text(
      "Which ranges each brand offers for every kind of terminal block, a similar part side by side, and what to check. Neither brand is better for every job: it depends on the connection type, the functions you need and what's already in the panel.",
      { width: W, lineGap: 2 },
    );
  doc.moveDown(1);

  // ---- table
  const headerRow = () => {
    const y = doc.y;
    doc.rect(M, y, W, 26).fill(INK);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#efe9de");
    doc.text(a.name, M + col[0] + pad, y + 8, { width: col[1] - pad * 2 });
    doc.text(b.name, M + col[0] + col[1] + pad, y + 8, { width: col[2] - pad * 2 });
    doc.y = y + 26;
  };
  const ensure = (h: number) => {
    if (doc.y + h > bottom()) {
      doc.addPage();
      doc.y = M;
      headerRow();
    }
  };

  headerRow();
  for (const s of sections(a, b)) {
    ensure(22 + 24);
    const y = doc.y;
    doc.rect(M, y, W, 20).fill(PAPER2);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text(s.title, M + pad, y + 6, { continued: Boolean(s.note) });
    if (s.note) doc.font("Helvetica").fontSize(8.5).fillColor(STEEL).text(`   ${s.note}`);
    doc.y = y + 20;

    for (const r of s.rows) {
      const cells = [r.label, r.a || "—", r.b || "—"];
      const fonts = ["Helvetica-Bold", "Helvetica", "Helvetica"];
      const h = Math.max(...cells.map((c, i) => doc.font(fonts[i]).fontSize(9).heightOfString(c, { width: col[i] - pad * 2, lineGap: 1.5 }))) + pad * 2;
      ensure(h);
      const top = doc.y;
      let x = M;
      cells.forEach((c, i) => {
        const empty = i > 0 && c === "—";
        doc
          .font(fonts[i])
          .fontSize(9)
          .fillColor(empty ? STEEL : i === 0 ? INK : MUTED)
          .text(c, x + pad, top + pad, { width: col[i] - pad * 2, lineGap: 1.5 });
        x += col[i];
      });
      doc.y = top + h;
      doc.moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(0.5).strokeColor(LINE).stroke();
    }
  }

  // ---- how to choose
  const tips = [
    "Extending an existing panel: stay with the brand and series already on the rail, so jumpers, end plates and markers fit.",
    "New design: pick the connection type first (push-in, spring or screw), then compare the ranges for the special functions you need.",
    "Check approvals (UL, CSA, IEC) and the rated current for your exact conductor size on each datasheet.",
    "Mixing brands on one rail is common, but accessories almost never fit across brands.",
  ];
  const tipsH = tips.reduce((n, t) => n + doc.font("Helvetica").fontSize(9.5).heightOfString(t, { width: W - 16 }) + 4, 30);
  if (doc.y + 18 + tipsH > bottom()) {
    doc.addPage();
    doc.y = M;
  } else doc.moveDown(1.2);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text("How to choose between them", M, doc.y, { width: W });
  doc.moveDown(0.4);
  for (const t of tips) {
    const y = doc.y;
    doc.rect(M, y + 4, 3, 3).fill(OK);
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text(t, M + 12, y, { width: W - 16, lineGap: 1.5 });
    doc.moveDown(0.3);
  }

  // ---- sources and notes
  const sources = [a, b].filter((x) => x.part?.source);
  doc.moveDown(0.8);
  if (doc.y + 70 > bottom()) {
    doc.addPage();
    doc.y = M;
  }
  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("Sources", M, doc.y, { width: W });
  doc.moveDown(0.2);
  for (const x of sources) {
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`${x.name} ${x.part!.name}: `, { width: W, continued: true }).fillColor(ACCENT).text(x.part!.source, { link: x.part!.source, underline: false });
  }
  doc.moveDown(0.6);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(STEEL)
    .text(
      `"—" means not listed, not that the brand doesn't make it. Product families and ratings come from the manufacturers' catalogues and datasheets and can change: always confirm on the current datasheet before ordering. Manufacturer names are trademarks of their owners, used to identify products only. Latest version: ${site.url}/compare/${pairSlug(a.slug, b.slug)}`,
      { width: W, lineGap: 1.5 },
    );

  // ---- page footers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // writing in the bottom margin must not start a new page
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(STEEL)
      .text(`${site.name} · ${a.name} vs ${b.name} · page ${i + 1} of ${range.count}`, M, doc.page.height - M, { width: W, align: "center", lineBreak: false });
  }

  doc.end();
  return done;
}
