import ExcelJS from "exceljs";

export type BomLine = { part: string; manufacturer: string; qty: number | null; notes: string };
export type BomResult = { lines: BomLine[]; warnings: string[]; columns: Record<string, string | null> };

const MAX_LINES = 500;

// Strong part-number headings win over weak ones like a bare "Item" (often just row numbers).
const PART_STRONG = /^(part|p\/?n|pn|part ?(no|number|#)|catalog(ue)?( ?(no|number|#))?|cat\.? ?no|mpn|mfr ?part|order ?(no|code|number)|item ?(no|number|code))\b/i;
const PART_WEAK = /^(item|model|article|reference|ref)\b/i;

const HEADERS = {
  part: PART_STRONG,
  manufacturer: /^(manufacturer|manuf|mfr|mfg|brand|make|vendor|supplier)\b/i,
  qty: /^(qty|quantity|quant|qté|count|pcs|units?|amount|order qty)\b/i,
  description: /^(description|desc|designation|details|name|item description)\b/i,
};

/* ------------------------------ readers ------------------------------ */

function decodeText(bytes: Uint8Array) {
  let text = new TextDecoder("utf-8").decode(bytes);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

/** RFC 4180-ish CSV parser with quoted fields; delimiter auto-detected. */
export function parseDelimited(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = ["\t", ";", ","].map((d) => [d, firstLine.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
    if (rows.length > MAX_LINES + 50) break;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim()));
}

async function readXlsx(bytes: Uint8Array): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
  // First worksheet that actually has data
  const ws = wb.worksheets.find((s) => s.actualRowCount > 0);
  if (!ws) return [];
  const rows: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    if (rows.length > MAX_LINES + 50) return;
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cells[col - 1] = (cell.text ?? "").toString().trim();
    });
    rows.push(Array.from(cells, (c) => c ?? ""));
  });
  return rows;
}

/* ------------------------------ mapping ------------------------------ */

type Cols = { part: number; manufacturer: number; qty: number; description: number };

function findHeader(rows: string[][]): { index: number; cols: Cols } | null {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const cols: Cols = { part: -1, manufacturer: -1, qty: -1, description: -1 };
    rows[r].forEach((h, c) => {
      const v = h.trim();
      for (const key of Object.keys(HEADERS) as (keyof Cols)[]) {
        if (cols[key] === -1 && HEADERS[key].test(v)) cols[key] = c;
      }
    });
    if (cols.part === -1) cols.part = rows[r].findIndex((h) => PART_WEAK.test(h.trim()));
    if ((cols.part !== -1 || cols.description !== -1) && (cols.qty !== -1 || cols.manufacturer !== -1)) return { index: r, cols };
  }
  return null;
}

const toQty = (v: string) => {
  const n = Number(v.replace(/[\s,]/g, "").replace(/(pcs|ea|x)$/i, ""));
  return Number.isFinite(n) && n > 0 && n < 10_000_000 ? Math.round(n) : null;
};

function guessColumns(rows: string[][]): Cols {
  const width = Math.max(...rows.slice(0, 50).map((r) => r.length), 0);
  const sample = rows.slice(0, 50);
  const numericShare = (c: number) => sample.filter((r) => toQty(r[c] ?? "") !== null).length / Math.max(sample.length, 1);
  const textShare = (c: number) => sample.filter((r) => /[a-z]/i.test(r[c] ?? "")).length / Math.max(sample.length, 1);
  let qty = -1;
  for (let c = 0; c < width; c++) if (numericShare(c) > 0.6) qty = c;
  let part = -1;
  for (let c = 0; c < width; c++) if (c !== qty && (textShare(c) > 0.3 || numericShare(c) > 0.6)) {
    part = c;
    break;
  }
  return { part, manufacturer: -1, qty, description: -1 };
}

export function rowsToLines(rows: string[][]): BomResult {
  const warnings: string[] = [];
  const clean = rows.filter((r) => r.some((c) => c));
  if (!clean.length) return { lines: [], warnings: ["The file is empty."], columns: {} };

  const header = findHeader(clean);
  const cols = header?.cols ?? guessColumns(clean);
  const body = header ? clean.slice(header.index + 1) : clean;
  if (!header) warnings.push("No header row found, so columns were guessed. Check the lines.");

  const headerRow = header ? clean[header.index] : [];
  const columns = Object.fromEntries(
    (Object.keys(cols) as (keyof Cols)[]).map((k) => [k, cols[k] >= 0 ? headerRow[cols[k]] || `column ${cols[k] + 1}` : null]),
  );

  const lines: BomLine[] = [];
  for (const r of body) {
    const partCell = cols.part >= 0 ? r[cols.part] ?? "" : "";
    const desc = cols.description >= 0 ? r[cols.description] ?? "" : "";
    const part = (partCell || desc).trim();
    if (!part || /^(total|subtotal)\b/i.test(part)) continue;
    lines.push({
      part: part.slice(0, 120),
      manufacturer: (cols.manufacturer >= 0 ? r[cols.manufacturer] ?? "" : "").slice(0, 80),
      qty: cols.qty >= 0 ? toQty(r[cols.qty] ?? "") : null,
      notes: partCell && desc && desc !== partCell ? desc.slice(0, 200) : "",
    });
    if (lines.length >= MAX_LINES) {
      warnings.push(`Only the first ${MAX_LINES} lines were read.`);
      break;
    }
  }
  if (!lines.length) warnings.push("No part numbers were found in the file.");
  return { lines, warnings, columns };
}

/* ------------------------------ entry ------------------------------ */

export class BomError extends Error {}

export async function parseBom(fileName: string, bytes: Uint8Array): Promise<BomResult> {
  const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  if (ext === ".csv" || ext === ".tsv" || ext === ".txt") return rowsToLines(parseDelimited(decodeText(bytes)));
  if (ext === ".xlsx") {
    try {
      return rowsToLines(await readXlsx(bytes));
    } catch {
      throw new BomError("This Excel file couldn't be read. Try saving it again as .xlsx or .csv.");
    }
  }
  if (ext === ".xls") throw new BomError("Old .xls files aren't supported yet. Please save as .xlsx or .csv.");
  throw new BomError("Only Excel (.xlsx) and CSV files can be read automatically.");
}
