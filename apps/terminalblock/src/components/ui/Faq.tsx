import { Plus } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

export function Faq({ items, withSchema = true }: { items: { q: string; a: string }[]; withSchema?: boolean }) {
  return (
    <>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-left font-medium transition-colors hover:bg-paper-2/60 sm:px-6 [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-steel transition-transform duration-150 group-open:rotate-45 group-open:text-ink">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <p className="-mt-1 px-5 pb-6 leading-relaxed text-ink-4 sm:px-6">{f.a}</p>
          </details>
        ))}
      </div>
      {withSchema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
    </>
  );
}
