import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight } from "lucide-react";
import { getType, productTypes } from "@/data/types";
import { brands, compareCategories, offers, SHOP_DOMAIN } from "@/data/brands";
import { buyLinks } from "@/data/buy-links";
import { DinRail } from "@/components/brand/DinRail";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { getPhoto } from "@/data/photos";
import { TypeCard } from "@/components/home/TypesGrid";
import { Faq } from "@/components/ui/Faq";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";

export function generateStaticParams() {
  return productTypes.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/types/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = getType(slug);
  if (!t) return {};
  return { title: t.name, description: `${t.short} Typical specs, what to watch for, and which product family each brand offers.` };
}

export default function TypePage({ params }: PageProps<"/types/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TypeContent params={params} />
    </Suspense>
  );
}

async function TypeContent({ params }: { params: PageProps<"/types/[slug]">["params"] }) {
  const { slug } = await params;
  const t = getType(slug);
  if (!t) notFound();

  // Which product family each brand offers for this type (from the comparison data)
  const category = compareCategories.find((c) => c.typeSlug === t.slug);
  const byBrand = category ? brands.filter((b) => offers(b, category.id)).map((b) => ({ brand: b, range: b.ranges[category.id] })) : [];
  const others = productTypes.filter((x) => x.slug !== t.slug).slice(0, 5);
  const photo = getPhoto(t.slug);
  const shop = buyLinks[t.slug] ?? buyLinks.default;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Types", item: `${site.url}/types` },
            { "@type": "ListItem", position: 3, name: t.name, item: `${site.url}/types/${t.slug}` },
          ],
        }}
      />
      <section className="blueprint relative overflow-hidden text-white">
        <Container className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-[#8a847a]" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-[#efe9de]">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/types" className="transition-colors hover:text-[#efe9de]">Types</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#aaa398]">{t.name}</span>
            </nav>
            <div className="mt-6">
              <Eyebrow code={t.code} tone="light">Product type</Eyebrow>
            </div>
            <h1 className="mt-4 text-balance text-[36px] font-medium leading-[1.08] text-[#efe9de] sm:text-[48px] sm:tracking-[-0.02em]">{t.name}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#aaa398]">{t.short}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/compare" size="lg">
                Compare brands <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="#ask" variant="outline-light" size="lg">
                Ask a question
              </ButtonLink>
            </div>
          </div>
          {photo ? (
            <figure>
              <div className={photo.cutout ? "aspect-[4/3] rounded-2xl bg-paper p-8 sm:p-10" : "aspect-[4/3] overflow-hidden rounded-2xl bg-ink-3"}>
                <ProductPhoto photo={photo} sizes="(min-width: 1024px) 480px, 100vw" preload />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-[#8a847a]">
                <span>
                  Shown: {photo.part ?? `an example of ${t.name.toLowerCase()}`}
                  {photo.number && !photo.number.includes(",") ? ` (${photo.number})` : ""}
                </span>
              </figcaption>
            </figure>
          ) : (
            <div className="flex justify-center text-[12px] sm:text-[15px] lg:justify-end">
              <div className="[transform:perspective(1200px)_rotateY(-18deg)_rotateX(8deg)]">
                <DinRail modules={Array.from({ length: 6 }, () => ({ ...t.visual }))} />
              </div>
            </div>
          )}
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xl leading-relaxed text-ink-3">{t.intro}</p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-line p-6">
                <h2 className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-[18px] w-[18px] text-steel" /> Best for
                </h2>
                <ul className="mt-4 space-y-2.5 text-ink-3">
                  {t.bestFor.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px]"><span className="mt-[11px] h-px w-2 shrink-0 bg-steel" />{b}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line p-6">
                <h2 className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-[18px] w-[18px] text-steel" /> Watch for
                </h2>
                <ul className="mt-4 space-y-2.5 text-ink-3">
                  {t.watchFor.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px]"><span className="mt-[11px] h-px w-2 shrink-0 bg-steel" />{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {byBrand.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-medium">By brand</h2>
                <p className="mt-2 text-ink-4">The product family to look for in each manufacturer&apos;s catalogue.</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper-2 text-xs text-ink-4">
                      <tr>
                        <th className="px-4 py-3 font-normal">Brand</th>
                        <th className="px-4 py-3 font-normal">Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {byBrand.map(({ brand, range }) => (
                        <tr key={brand.slug}>
                          <td className="px-4 py-3 font-medium">{brand.name}</td>
                          <td className="px-4 py-3 text-ink-3">{range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-steel">
                  From the manufacturers&apos; catalogues and datasheets; always confirm on the current datasheet.{" "}
                  <Link href="/compare" className="underline hover:text-ink">
                    Compare brands side by side
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-12">
              <h2 className="mb-5 text-2xl font-medium">Common questions</h2>
              <Faq items={t.faqs} />
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="border-b border-line px-5 py-3 text-sm text-steel">Typical specs</div>
              <dl className="divide-y divide-line">
                {t.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                    <dt className="text-ink-4">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <h3 className="text-lg font-medium">Choosing {t.name.toLowerCase()}?</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-4">See how the brands compare, or ask us a question about your application.</p>
              <ButtonLink href="/compare" className="mt-5 w-full">
                Compare brands
              </ButtonLink>
            </div>
            {shop && (
              <a
                href={shop.href}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between gap-3 rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
              >
                <span>
                  <span className="block text-sm text-steel">Where to buy</span>
                  <span className="mt-1 block font-medium">{shop.label}</span>
                  <span className="text-xs text-steel">at {SHOP_DOMAIN}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-steel" />
              </a>
            )}
          </aside>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-2/50 py-14">
        <Container>
          <h2 className="text-2xl font-medium">Other types</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {others.map((o) => (
              <TypeCard key={o.slug} t={o} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
