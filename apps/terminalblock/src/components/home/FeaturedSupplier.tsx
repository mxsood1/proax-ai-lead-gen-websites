import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Section";

const points = [
  { k: "Pricing", v: "In Canadian dollars" },
  { k: "One supplier", v: "Accountable for the whole quote, request to delivery" },
  { k: "Equivalents", v: "Flagged for your approval, never swapped silently" },
];

/**
 * Proax appears as the featured supplier that fulfils quotes, not as the
 * site's brand. Facts here stay generic on purpose: add claims (stock, years,
 * locations) only once Proax marketing has confirmed them.
 */
export function FeaturedSupplier() {
  const s = site.featuredSupplier;
  return (
    <section className="border-t border-line py-24 sm:py-32" aria-labelledby="featured-supplier">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="text-sm text-steel">Featured supplier</p>
          <h2 id="featured-supplier" className="mt-4">
            <Image src={s.logoDark.src} alt={s.name} width={s.logoDark.width} height={s.logoDark.height} className="h-auto w-[200px]" />
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-ink-4">
            Quotes on {site.name} are prepared and fulfilled by {s.name}, a {s.blurb}.
          </p>
          <a
            href={s.url}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center gap-1.5 font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
          >
            Visit {s.name} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          {points.map((p) => (
            <div key={p.k} className="grid grid-cols-[8rem_1fr] gap-4 py-4">
              <dt className="text-sm text-steel">{p.k}</dt>
              <dd className="text-ink-3">{p.v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
