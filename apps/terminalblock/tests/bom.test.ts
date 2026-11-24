import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { BomError, parseBom, parseDelimited, rowsToLines } from "@/server/bom/parse";

const enc = (s: string) => new TextEncoder().encode(s);

describe("CSV reading", () => {
  it("reads a typical BOM with a header row", async () => {
    const csv = "Item,Part Number,Manufacturer,Description,Qty\n1,3044102,Phoenix Contact,UT 4 grey,120\n2,3044115,Phoenix Contact,UT 4 blue,40\n";
    const r = await parseBom("bom.csv", enc(csv));
    expect(r.lines).toEqual([
      { part: "3044102", manufacturer: "Phoenix Contact", qty: 120, notes: "UT 4 grey" },
      { part: "3044115", manufacturer: "Phoenix Contact", qty: 40, notes: "UT 4 blue" },
    ]);
    expect(r.warnings).toEqual([]);
  });

  it("handles semicolons, quoted commas and a UTF-8 byte-order mark", async () => {
    const csv = "﻿Cat No;Qty;Brand\n\"PT 2,5\";200;Phoenix\n\"UK 5-HESI, fuse\";24;Phoenix\n";
    const r = await parseBom("list.csv", enc(csv));
    expect(r.lines.map((l) => [l.part, l.qty, l.manufacturer])).toEqual([
      ["PT 2,5", 200, "Phoenix"],
      ["UK 5-HESI, fuse", 24, "Phoenix"],
    ]);
  });

  it("guesses columns when there is no header and says so", () => {
    const r = rowsToLines(parseDelimited("3044102,120\n3044115,40\n"));
    expect(r.lines.map((l) => [l.part, l.qty])).toEqual([
      ["3044102", 120],
      ["3044115", 40],
    ]);
    expect(r.warnings.join(" ")).toMatch(/guessed/);
  });

  it("skips blank and total rows", () => {
    const r = rowsToLines(parseDelimited("Part,Qty\n3044102,10\n,\nTotal,10\n"));
    expect(r.lines).toHaveLength(1);
  });
});

describe("Excel reading", () => {
  it("reads the first sheet of an .xlsx file", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("BOM");
    ws.addRow(["Part No", "Mfr", "Quantity"]);
    ws.addRow(["3044102", "Phoenix Contact", 120]);
    ws.addRow(["1SNA105001R2700", "ABB", 30]);
    const bytes = new Uint8Array(await wb.xlsx.writeBuffer());
    const r = await parseBom("bom.xlsx", bytes);
    expect(r.lines.map((l) => [l.part, l.manufacturer, l.qty])).toEqual([
      ["3044102", "Phoenix Contact", 120],
      ["1SNA105001R2700", "ABB", 30],
    ]);
  });

  it("rejects old .xls and unknown formats with a clear message", async () => {
    await expect(parseBom("old.xls", enc("x"))).rejects.toBeInstanceOf(BomError);
    await expect(parseBom("drawing.dwg", enc("x"))).rejects.toThrow(/Excel/);
  });

  it("reports a broken .xlsx instead of crashing", async () => {
    await expect(parseBom("broken.xlsx", enc("not a zip file"))).rejects.toBeInstanceOf(BomError);
  });
});
