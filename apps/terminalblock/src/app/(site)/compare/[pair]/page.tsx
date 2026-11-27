import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { ArrowRight, ChevronRight } from "lucide-react";
import { allPairs, compareCategories, offers, pairSlug, parsePair, pickerGroups, popularPairs, getBrand } from "@/data/brands";
import { BrandPicker } from "@/components/compare/BrandPicker";
import { CompareTable, DraftDataNote } from "@/components/compare/CompareTable";
import { ComparisonPdfOffer } from "@/components/compare/ComparisonPdfOffer";
import { Container } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";

/** Every pair is built ahead of time: no server work and no AI when someone compares. */
export function generateStaticParams() {
  return allPairs().map(([a, b]) => ({ pair: pairSlug(a.slug, b.slug) }));
}

export async function generateMetadata({ params }: PageProps<"/compare/[pair]">): Promise<Metadata> {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) return {};
  const [a, b] = p;
  return {
    title: `${a.name} vs ${b.name} terminal blocks`,
    description: `${a.name} and ${b.name} terminal blocks compared: push-in, spring, screw, fuse, disconnect and more, with strengths and things to check for each.`,
    alternates: { canonical: `/compare/${pairSlug(a.slug, b.slug)}` },
  };
}

export default function PairPage({ params }: PageProps<"/compare/[pair]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PairContent params={params} />
    </Suspense>
  );
}

async function PairContent({ params }: { params: PageProps<"/compare/[pair]">["params"] }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) notFound();
  const [a, b] = p;
  // A reversed URL ("weidmuller-vs-phoenix-contact") still works; its canonical tag points search engines to the one page per pair.
  const both = compareCategories.filter((c) => c.typeSlug && offers(a, c.id) && offers(b, c.id));
  const onlyA = compareCategories.filter((c) => c.typeSlug && offers(a, c.id) && !offers(b, c.id));
  const onlyB = compareCategories.filter((c) => c.typeSlug && offers(b, c.id) && !offers(a, c.id));
  const more = popularPairs.filter(([x, y]) => pairSlug(x, y) !== pairSlug(a.slug, b.slug)).slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Compare brands", item: `${site.url}/compare` },
            { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name}`, item: `${site.url}/compare/${pairSlug(a.slug, b.slug)}` },
          ],
        }}
      />
      <section className="blueprint text-[#efe9de]">
        <Container className="py-14 sm:py-16">
          <nav className="flex items-center gap-1.5 text-sm text-[#8a847a]" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-[#efe9de]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="transition-colors hover:text-[#efe9de]">Compare brands</Link>
          </nav>
          <h1 className="mt-6 max-w-4xl text-balance text-[36px] font-medium leading-[1.08] sm:text-[48px] sm:tracking-[-0.02em]">
            {a.name} vs {b.name} terminal blocks
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#c9c2b6]">
            Which ranges each brand offers for every kind of terminal block, and what each does well. Neither is better for every job: it depends on the
            connection type, the functions you need and what&apos;s already in the panel.
          </p>
          <div className="mt-8 max-w-3xl">
            <BrandPicker groups={pickerGroups()} a={a.slug} b={b.slug} tone="light" />
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container className="space-y-12">
          <div>
            <h2 className="text-2xl font-medium">At a glance</h2>
            <div className="mt-5 grid gap-x-10 gap-y-3 text-[15px] sm:grid-cols-3">
              <p>
                <span className="text-steel">Both offer: </span>
                {both.length ? both.map((c) => c.label).join(", ") : "no overlap listed yet"}
              </p>
              <p>
                <span className="text-steel">Only {a.name} listed for: </span>
                {onlyA.length ? onlyA.map((c) => c.label).join(", ") : "none"}
              </p>
              <p>
                <span className="text-steel">Only {b.name} listed for: </span>
                {onlyB.length ? onlyB.map((c) => c.label).join(", ") : "none"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium">
              {a.name} vs {b.name}, side by side
            </h2>
            <div className="mt-5">
              <CompareTable brands={[a, b]} />
            </div>
            <div className="mt-3">
              <DraftDataNote />
            </div>
          </div>

          <ComparisonPdfOffer pair={pairSlug(a.slug, b.slug)} title={`${a.name} vs ${b.name}`} />

          <div className="rounded-2xl bg-paper-2/60 p-6 text-[15px] leading-relaxed text-ink-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <h2 className="text-lg font-medium text-ink">How to choose between them</h2>
            <ul className="mt-3 space-y-2">
              <li>Extending an existing panel: stay with the brand and series already on the rail, so jumpers, end plates and markers fit.</li>
              <li>New design: pick the connection type first (push-in, spring or screw), then compare the ranges above for the special functions you need.</li>
              <li>Check approvals (UL, CSA, IEC) and the rated current for your exact conductor size on each datasheet.</li>
              <li>Mixing brands on one rail is common, but accessories almost never fit across brands.</li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-2/50 py-14">
        <Container>
          <h2 className="text-2xl font-medium">Other comparisons</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {more.map(([x, y]) => (
              <Link
                key={pairSlug(x, y)}
                href={`/compare/${pairSlug(x, y)}`}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-paper p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
              >
                <span className="font-medium leading-snug">
                  {getBrand(x)!.name} <span className="font-normal text-steel">vs</span> {getBrand(y)!.name}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-steel group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
