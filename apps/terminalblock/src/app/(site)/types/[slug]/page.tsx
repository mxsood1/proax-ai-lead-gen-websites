import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { getType, productTypes } from "@/data/types";
import { rfqHref } from "@/data/products";
import { getCatalog } from "@/data/catalog";
import { DinRail } from "@/components/brand/DinRail";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { getPhoto } from "@/data/photos";
import { TypeCard } from "@/components/home/TypesGrid";
import { Faq } from "@/components/ui/Faq";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Container, Eyebrow } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";

export function generateStaticParams() {
  return productTypes.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/types/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = getType(slug);
  if (!t) return {};
  return { title: t.name, description: `${t.short} Typical specs, what to watch for, and how to source ${t.name.toLowerCase()} in Canada.` };
}

const typeToFn: Record<string, string[]> = {
  "push-in": ["push-in"],
  "spring-clamp": ["spring"],
  "screw-clamp": ["screw"],
};

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

  const catalog = getCatalog();
  const fnForType: Record<string, string> = { ground: "ground", fuse: "fuse", disconnect: "disconnect", "multi-level": "multi-level", pcb: "pcb", accessories: "accessory" };
  const related = catalog.items
    .filter((p) =>
      typeToFn[t.slug] ? !!p.connection && typeToFn[t.slug].includes(p.connection) && p.fn === "feed-through" : p.fn === fnForType[t.slug],
    )
    // parts with their own page (the best sellers) first, then in-stock parts
    .sort((a, b) => Number(!!b.page) - Number(!!a.page) || Number(!!b.inStock) - Number(!!a.inStock))
    .slice(0, 8);
  const others = productTypes.filter((x) => x.slug !== t.slug).slice(0, 5);
  const photo = getPhoto(t.slug);

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
              <ButtonLink href={`/rfq?q=${encodeURIComponent(t.name)}`} size="lg">
                Get a quote <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/finder" variant="outline-light" size="lg">
                Open the finder
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
                {photo.number && !photo.number.includes(",") && photo.part && (
                  <Link
                    href={rfqHref([{ partNumber: photo.number, manufacturer: "Phoenix Contact" }])}
                    className="text-[#efe9de] underline decoration-[#efe9de]/30 underline-offset-4 hover:decoration-[#efe9de]"
                  >
                    Quote this part
                  </Link>
                )}
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

            {related.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-medium">{catalog.source === "supplier" ? "In the catalog" : "Popular series"}</h2>
                  {catalog.source === "supplier" ? <Badge tone="signal">Featured supplier catalog</Badge> : <Badge tone="demo">Sample data</Badge>}
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper-2 text-xs text-ink-4">
                      <tr>
                        <th className="px-4 py-3">Part</th>
                        <th className="hidden px-4 py-3 sm:table-cell">Wire</th>
                        <th className="hidden px-4 py-3 sm:table-cell">Current</th>
                        <th className="px-4 py-3 text-right">RFQ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {related.map((p) => (
                        <tr key={p.id} className="hover:bg-paper-2/50">
                          <td className="px-4 py-3">
                            <div className="font-mono font-medium">
                              {p.page ? (
                                <Link href={p.page} className="underline decoration-line underline-offset-4 hover:decoration-ink">
                                  {p.partNumber}
                                </Link>
                              ) : (
                                p.partNumber
                              )}
                            </div>
                            <div className="text-xs text-ink-4">{p.manufacturer}</div>
                          </td>
                          <td className="hidden px-4 py-3 font-mono sm:table-cell">{p.wireMax !== null ? `${p.wireMax} mm²` : "—"}</td>
                          <td className="hidden px-4 py-3 font-mono sm:table-cell">{p.current !== null ? `${p.current} A` : "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <Link href={rfqHref([p])} className="inline-flex items-center gap-1 font-medium text-ink transition-colors hover:text-signal">
                              Quote <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <h3 className="text-lg font-medium">Need {t.name.toLowerCase()}?</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-4">Send part numbers or specs and we’ll come back with options from several suppliers.</p>
              <ButtonLink href={`/rfq?q=${encodeURIComponent(t.name)}`} className="mt-5 w-full">
                Request a quote
              </ButtonLink>
            </div>
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
