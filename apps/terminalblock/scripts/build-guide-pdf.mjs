/**
 * Builds the downloadable guide (the email lead magnet):
 *   content/downloads/terminal-block-bom-checklist.pdf
 * It is NOT in /public, so it can only be downloaded through the email form.
 * Run: npm run guide:pdf
 */
import { mkdirSync, createWriteStream } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const OUT = path.join(process.cwd(), "content", "downloads", "terminal-block-bom-checklist.pdf");
mkdirSync(path.dirname(OUT), { recursive: true });

const INK = "#1b1915", MUTED = "#5e554a", LINE = "#e0d9cc", PAPER2 = "#eee9df", ACCENT = "#c2410c";
const doc = new PDFDocument({ size: "LETTER", margins: { top: 54, bottom: 54, left: 54, right: 54 }, info: { Title: "Terminal block selection & BOM checklist", Author: "TerminalBlock.ca" } });
doc.pipe(createWriteStream(OUT));
const W = doc.page.width - 108;

const h1 = (t) => doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text(t, { width: W });
const h2 = (t) => { doc.moveDown(0.9); doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text(t, { width: W }); doc.moveDown(0.35); };
const p = (t) => doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(t, { width: W, lineGap: 2 });
const tag = (t) => { const y = doc.y; doc.rect(54, y, doc.widthOfString(t, { font: "Courier" }) + 14, 16).lineWidth(0.8).strokeColor(INK).stroke(); doc.font("Courier").fontSize(9).fillColor(INK).text(t, 61, y + 4); doc.y = y + 24; doc.x = 54; };

function table(head, rows, widths) {
  const x0 = 54;
  let y = doc.y;
  const rowH = 18;
  doc.rect(x0, y, W, rowH).fill(PAPER2);
  let x = x0;
  head.forEach((h, i) => { doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text(h, x + 6, y + 5, { width: widths[i] - 12 }); x += widths[i]; });
  y += rowH;
  for (const r of rows) {
    x = x0;
    // row grows to fit the tallest wrapped cell
    const h = Math.max(rowH, ...r.map((c, i) => doc.font(i === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(9).heightOfString(c, { width: widths[i] - 12 }) + 9));
    r.forEach((c, i) => { doc.font(i === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(INK).text(c, x + 6, y + 5, { width: widths[i] - 12 }); x += widths[i]; });
    y += h;
    doc.moveTo(x0, y).lineTo(x0 + W, y).lineWidth(0.5).strokeColor(LINE).stroke();
  }
  doc.y = y + 6;
  doc.x = x0;
}

function checklist(items) {
  for (const it of items) {
    const y = doc.y;
    doc.rect(54, y + 1, 9, 9).lineWidth(0.8).strokeColor(INK).stroke();
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(it, 72, y, { width: W - 18, lineGap: 1 });
    doc.moveDown(0.35);
    doc.x = 54;
  }
}

// ---------------------------------------------------------------- page 1
tag("TB-GUIDE-01");
h1("Terminal block selection & BOM checklist");
doc.moveDown(0.3);
p("A two-page reference for panel builders, engineers and buyers: convert wire sizes, pick a connection style, and make sure nothing is missing from the terminal block lines on your bill of materials.");

h2("1. Wire size: AWG to mm²");
table(
  ["AWG", "Exact cross-section", "Nearest metric size", "Typical block size"],
  [
    ["22 AWG", "0.33 mm²", "0.34 mm²", "1.5 mm² blocks"],
    ["20 AWG", "0.52 mm²", "0.5 mm²", "1.5 mm² blocks"],
    ["18 AWG", "0.82 mm²", "0.75 mm²", "1.5 or 2.5 mm² blocks"],
    ["16 AWG", "1.31 mm²", "1.5 mm²", "2.5 mm² blocks"],
    ["14 AWG", "2.08 mm²", "2.5 mm²", "2.5 or 4 mm² blocks"],
    ["12 AWG", "3.31 mm²", "4 mm²", "4 mm² blocks"],
    ["10 AWG", "5.26 mm²", "6 mm²", "6 mm² blocks"],
    ["8 AWG", "8.37 mm²", "10 mm²", "10 mm² blocks"],
  ],
  [80, 130, 130, W - 340],
);
p("A block's nominal size is a rating, not the largest wire it takes. Ferrules make the conductor bigger at the clamp, so check the datasheet's ferruled range if your shop uses ferrules.");

h2("2. Connection style at a glance");
table(
  ["Style", "Best for", "Watch for"],
  [
    ["Push-in", "Fast wiring of solid or ferruled wire", "Fine-stranded wire without ferrules needs the release"],
    ["Spring clamp", "Vibration, fine-stranded wire", "Needs a tool to open the clamp"],
    ["Screw clamp", "Widest wire range, large sizes", "Tighten to the rated torque"],
  ],
  [100, 190, W - 290],
);

h2("3. Colours that matter");
p("Green-yellow is reserved for protective earth (PE) blocks that bond to the DIN rail. Blue commonly marks neutral, grey or beige general circuits, and orange often marks circuits fed from outside the panel. Your customer's or shop's standard always comes first.");

// ---------------------------------------------------------------- page 2
doc.addPage();
tag("TB-GUIDE-01 · BOM CHECKLIST");
h1("Before you send the BOM");
doc.moveDown(0.3);
p("Missing accessories are the most common reason a terminal strip can't be finished on site. Tick each line before ordering.");

h2("Blocks");
checklist([
  "Feed-through blocks: size, colour and quantity for every circuit",
  "Ground (PE) blocks matched to the feed-through size, approved for your rail",
  "Fuse blocks: fuse format (5 × 20 mm or 1/4 × 1-1/4 in) and LED voltage",
  "Disconnect or test blocks where circuits will be measured; CT shorting blocks for current transformers",
  "Double- or triple-level blocks where rail space is tight",
]);

h2("Accessories");
checklist([
  "End plates (covers) for the open side of the last block of each series",
  "End stops at both ends of every strip",
  "Jumpers (bridges) with the right pole count, one set per level for multi-level blocks",
  "Markers: printed, blank, or for your label printer",
  "DIN rail: profile (35 × 7.5 or 35 × 15 mm), material, slotted or solid, length",
  "Ferrules in each wire size, plus the crimp tool if needed",
]);

h2("Details to put on the RFQ");
checklist([
  "Manufacturer and part number, or wire size + connection style if you're open to equivalents",
  "Quantities per line, and whether equivalents are acceptable",
  "Required approvals (UL, CSA) and the date you need the parts",
]);

doc.moveDown(1.2);
const y = doc.y;
doc.rect(54, y, W, 62).fill(INK);
doc.font("Helvetica-Bold").fontSize(13).fillColor("#efe9de").text("Send the whole list for one quote", 70, y + 12, { width: W - 32 });
doc.font("Helvetica").fontSize(10).fillColor("#aaa398").text("Upload your BOM or paste part numbers at terminalblock.ca/rfq. Blocks, jumpers, end plates, markers and rail in one request.", 70, y + 32, { width: W - 32 });
doc.fillColor(ACCENT);

doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text(
  "General guidance only. Always confirm ratings, conductor ranges and approvals against the manufacturer's datasheet. Manufacturer names are trademarks of their owners.",
  54, doc.page.height - 72, { width: W },
);
doc.end();
console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
