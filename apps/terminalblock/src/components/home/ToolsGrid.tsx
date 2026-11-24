import Link from "next/link";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { Container, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

function FinderArt() {
  const rows = [
    ["Wire size", "2.5 mm²", "50%"],
    ["Min. current", "24 A", "60%"],
    ["Connection", "Push-in", "33%"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-6">
      {rows.map(([label, value, w]) => (
        <div key={label}>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-ink-4">{label}</span>
            <span className="font-mono tabular-nums text-ink">{value}</span>
          </div>
          <div className="h-1 rounded-full bg-line">
            <div className="relative h-full rounded-full bg-ink" style={{ width: w }}>
              <span className="absolute -right-2 -top-1.5 h-4 w-4 rounded-full bg-paper shadow-[0_0_0_1px_var(--color-ink)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IdentifyArt() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative p-4">
        <TerminalModule variant="grey" label="?" scale={10} />
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-ink-4 ${c}`} />
        ))}
      </div>
    </div>
  );
}

function XrefArt() {
  return (
    <div className="flex h-full items-center justify-center gap-4">
      <TerminalModule variant="grey" label="UK 4" connection="screw" scale={9} />
      <ArrowRightLeft className="h-[18px] w-[18px] text-steel" />
      <TerminalModule variant="grey" label="M4/6" connection="screw" scale={9} />
    </div>
  );
}

function BomArt() {
  const rows = [
    ["3044102", "120", true],
    ["3044115", "40", true],
    ["3046223", "20", true],
    ["3047028", "10", false],
  ] as const;
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-6">
      {rows.map(([pn, qty, ok]) => (
        <div key={pn} className="grid grid-cols-[1fr_auto_88px] items-center gap-4 text-xs">
          <span className="marker justify-self-start">{pn}</span>
          <span className="font-mono tabular-nums text-ink-4">×{qty}</span>
          <span className={cn("text-right", ok ? "text-ok" : "text-steel")}>{ok ? "Matched" : "Checking"}</span>
        </div>
      ))}
    </div>
  );
}

const tools = [
  { href: "/finder", title: "Terminal block finder", text: "Filter the catalog by wire size, current, connection and function, then add matches straight to your RFQ.", art: FinderArt, wide: true },
  { href: "/identify", title: "Identify from a photo", text: "Upload the block or its label. We work out what it is and what replaces it.", art: IdentifyArt },
  { href: "/identify?mode=part", title: "Cross-reference a part", text: "Enter a part number to see equivalent series from other manufacturers.", art: XrefArt },
  { href: "/rfq#bom", title: "Quote a whole BOM", text: "Upload your Excel or CSV bill of materials and we quote every line.", art: BomArt, wide: true },
];

export function ToolsGrid() {
  return (
    <section className="border-t border-line bg-paper-2/50 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Free tools"
          title="Find it, identify it, quote it"
          lede="Tools for engineers, panel builders and maintenance teams. Each one ends in a ready-to-send RFQ."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className={cn(
                "group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]",
                t.wide && "lg:col-span-2",
              )}
            >
              <div className="h-44 border-b border-line bg-paper-2/40">
                <t.art />
              </div>
              <div className="flex flex-1 items-end justify-between gap-6 p-6">
                <div>
                  <h3 className="text-lg font-medium">{t.title}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-4">{t.text}</p>
                </div>
                <ArrowRight className="h-[18px] w-[18px] shrink-0 text-steel transition-colors group-hover:text-ink" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
