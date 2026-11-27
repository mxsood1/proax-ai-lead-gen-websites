import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { brandGroups, getBrand, pairSlug, pickerGroups, popularPairs, SHOP_DOMAIN, type Brand } from "@/data/brands";
import { PageHeader } from "@/components/layout/PageHeader";
import { BrandPicker } from "@/components/compare/BrandPicker";
import { Container, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Compare terminal block brands",
  description:
    "Phoenix Contact, Weidmüller, WAGO, Schneider Electric, ABB, Siemens, Eaton, Molex and more, side by side: which ranges each brand offers for push-in, spring, screw, fuse, PCB and more.",
};

function BrandCard({ brand, others }: { brand: Brand; others: Brand[] }) {
  return (
    <div className="flex flex-col rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-medium leading-snug">{brand.name}</h3>
        <span className="shrink-0 text-xs text-steel">{brand.hq}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-4">{brand.summary}</p>
      <div className="mt-auto pt-5">
        <div className="text-xs text-steel">Compare with</div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/compare/${pairSlug(brand.slug, o.slug)}`}
                className="inline-flex h-8 items-center rounded-lg px-3 text-sm text-ink-3 shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
        {brand.buy && (
          <a
            href={brand.buy.href}
            target="_blank"
            rel="noopener"
            className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-ink-3 transition-colors hover:text-ink"
          >
            <span>
              {brand.buy.label} <span className="text-steel">at {SHOP_DOMAIN}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-steel" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Compare brands"
        title="Terminal block brands, side by side"
        lede="Pick any two brands to see which ranges each one offers for every kind of terminal block, with strengths and things to check for both."
        image="header-identify"
        imagePosition="center 35%"
      >
        <div className="max-w-3xl">
          <BrandPicker groups={pickerGroups()} a="phoenix-contact" b="weidmuller" tone="light" />
        </div>
      </PageHeader>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Popular comparisons" title="What engineers compare most" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularPairs.map(([x, y]) => (
              <Link
                key={pairSlug(x, y)}
                href={`/compare/${pairSlug(x, y)}`}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
              >
                <span className="text-lg font-medium leading-snug">
                  {getBrand(x)!.name} <span className="font-normal text-steel">vs</span> {getBrand(y)!.name}
                </span>
                <ArrowRight className="h-[18px] w-[18px] shrink-0 text-steel transition-colors group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-2/50 py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="All brands" title="Every brand we compare" lede="Grouped by the kind of maker they are. Pick a brand to compare it with a similar one." />
          <div className="mt-12 space-y-14">
            {brandGroups.map((g) => {
              const members = g.slugs.map((s) => getBrand(s)).filter((b): b is Brand => Boolean(b));
              return (
                <div key={g.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
                    <h3 className="text-xl font-medium">{g.label}</h3>
                    <p className="text-sm text-steel">{g.hint}</p>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((b) => (
                      <BrandCard key={b.slug} brand={b} others={members.filter((o) => o.slug !== b.slug).slice(0, 3)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-10 text-xs text-steel">
            Ranges and part ratings come from the manufacturers&apos; catalogues and datasheets, with the source linked on each comparison. Ranges
            change: always confirm ratings and approvals on the current datasheet.
          </p>
        </Container>
      </section>
    </>
  );
}
