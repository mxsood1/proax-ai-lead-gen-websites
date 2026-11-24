import { Check } from "lucide-react";
import { Container, Marker, SectionHeading } from "@/components/ui/Section";

const oldWay = [
  { from: "sales@distributor-a", subj: "RE: RE: PT 2,5 pricing?", note: "No stock, 6 weeks" },
  { from: "quotes@distributor-b", subj: "Your request #88213", note: "Asks to confirm part number" },
  { from: "rep@supplier-c", subj: "Following up", note: "Quoted the wrong series" },
  { from: "info@supplier-d", subj: "No reply", note: "4 days" },
  { from: "orders@distributor-e", subj: "Quote attached (PDF)", note: "Another format to compare" },
];

const newWay = [
  "One form for part numbers, a BOM or a photo",
  "Every line identified and checked",
  "Equivalents flagged for your approval",
  "One reply with price and lead time",
];

export function OldWayNewWay() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why one RFQ"
          title="Your inbox, before and after"
          lede="Sourcing a terminal strip shouldn't take five threads and a spreadsheet to compare them."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {/* before */}
          <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Before</span>
              <span className="font-mono text-xs tabular-nums text-steel">5 threads, 3 days</span>
            </div>
            <ul className="mt-6 divide-y divide-line">
              {oldWay.map((m) => (
                <li key={m.from} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs text-steel">{m.from}</div>
                    <div className="truncate text-sm text-ink">{m.subj}</div>
                  </div>
                  <span className="hidden shrink-0 text-right text-xs text-bad sm:block">{m.note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* after */}
          <div className="rounded-2xl bg-ink p-6 text-[#efe9de] sm:p-8">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">After</span>
              <span className="font-mono text-xs tabular-nums text-[#8a847a]">1 request, 1 reply</span>
            </div>
            <div className="mt-6 rounded-xl bg-ink-3 p-5 shadow-[inset_0_0_0_1px_rgba(239,233,222,0.08)]">
              <div className="font-mono text-xs text-[#8a847a]">desk@terminalblock.ca</div>
              <div className="mt-2 flex items-center gap-3">
                <Marker>RFQ-TB-2481</Marker>
                <span className="text-[15px]">3 lines sourced</span>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-2.5 text-sm">
                <span className="text-xs text-[#8a847a]">Line</span>
                <span className="text-xs text-[#8a847a]">Lead time</span>
                <span className="text-right text-xs text-[#8a847a]">Status</span>
                {[
                  ["PT 2,5 ×200", "In stock", "Matched"],
                  ["PT 2,5-PE ×40", "In stock", "Matched"],
                  ["UK 5-HESI ×24", "2 weeks", "Alternative offered"],
                ].map((r) => (
                  <div key={r[0]} className="contents">
                    <span className="font-mono tabular-nums">{r[0]}</span>
                    <span className="text-[#aaa398]">{r[1]}</span>
                    <span className={r[2] === "Matched" ? "text-right text-[#4cc38a]" : "text-right text-[#aaa398]"}>{r[2]}</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {newWay.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-[#aaa398]">
                  <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#4cc38a]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
