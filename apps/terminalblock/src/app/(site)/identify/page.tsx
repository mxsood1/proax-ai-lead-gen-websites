import type { Metadata } from "next";
import { Suspense } from "react";
import { Camera, ShieldCheck, Users } from "lucide-react";
import { Identifier } from "@/components/identify/Identifier";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";
import { getCatalog } from "@/data/catalog";
import { config } from "@/server/config";

export const metadata: Metadata = {
  title: "Identify a terminal block from a photo or part number",
  description: "Upload a photo of a terminal block or enter a part number to identify it and find equivalent replacements from other manufacturers.",
};

/** A few real part numbers to try, spread across manufacturers. */
function pickExamples(items: { partNumber: string; manufacturer: string; fn: string }[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of items) {
    if (p.fn !== "feed-through" || seen.has(p.manufacturer)) continue;
    seen.add(p.manufacturer);
    out.push(p.partNumber);
    if (out.length === 4) break;
  }
  return out;
}

export default function IdentifyPage() {
  const catalog = getCatalog();
  return (
    <>
      <PageHeader
        code="T2"
        eyebrow="Free tool · Identify & cross-reference"
        title="What is this block — and what replaces it?"
        lede="Snap a photo of an unmarked or worn terminal block, or type an old part number. We'll identify it and suggest equivalents."
        image="header-identify"
        imagePosition="center 60%"
      />
      <section className="py-12 sm:py-16">
        <Container>
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-3xl bg-paper-2" />}>
            <Identifier catalog={catalog} examples={pickExamples(catalog.items)} aiEnabled={config.ai.enabled} />
          </Suspense>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Camera, title: "Works with worn labels", text: "Shape, colour, release style and width all help identify a block — even when the print is gone." },
              { icon: Users, title: "Human-verified", text: "Every AI match is checked by our sourcing team before you're quoted. No surprises on delivery." },
              { icon: ShieldCheck, title: "Private by default", text: "Your photos and part lists are used only to answer your request — never published or sold." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-line p-6">
                <f.icon className="h-[18px] w-[18px] text-steel" />
                <h3 className="mt-4 font-medium">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-4">{f.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
