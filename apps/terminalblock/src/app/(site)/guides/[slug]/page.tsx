import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock } from "lucide-react";
import { GuideBlocks } from "@/components/guides/GuideBlocks";
import { getPublishedGuide, getPublishedGuides } from "@/server/content/published";
import { GuideCard } from "@/components/guides/GuideCard";
import { Faq } from "@/components/ui/Faq";
import { Container } from "@/components/ui/Section";
import { AskQuestion } from "@/components/leads/AskQuestion";
import { buyLinkFor } from "@/data/buy-links";
import { getPhoto } from "@/data/photos";
import Image from "next/image";
import { getBrand, pairSlug, popularPairs, SHOP_DOMAIN } from "@/data/brands";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { productTypes } from "@/data/types";

export function generateStaticParams() {
  return getPublishedGuides().then((all) => all.map((g) => ({ slug: g.slug })));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = await getPublishedGuide(slug);
  if (!g) return {};
  return { title: g.title, description: g.description, openGraph: { type: "article", title: g.title, description: g.description } };
}

export default function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GuideContent params={params} />
    </Suspense>
  );
}

async function GuideContent({ params }: { params: PageProps<"/guides/[slug]">["params"] }) {
  const { slug } = await params;
  const g = await getPublishedGuide(slug);
  if (!g) notFound();
  const more = (await getPublishedGuides()).filter((x) => x.slug !== g.slug).slice(0, 3);
  const related = productTypes.filter((t) => g.related?.includes(t.slug));
  const buy = buyLinkFor(g.related);
  // Header image: the first image used in the article, else the product of its main topic
  const firstImage = g.body.find((b) => b.type === "image");
  const cover = [...(firstImage?.type === "image" ? firstImage.photos : []), ...(g.related ?? [])].map((id) => getPhoto(id)).find((p) => p?.cutout) ?? null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          ...(g.published ? { datePublished: g.published } : {}),
          dateModified: g.updated,
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          mainEntityOfPage: `${site.url}/guides/${g.slug}`,
        }}
      />
      <article>
        <header className="paper-grid border-b border-line">
          <Container className="grid max-w-6xl items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_320px]">
            <div>
            <nav className="flex items-center gap-1.5 text-sm text-steel" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-ink">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/guides" className="transition-colors hover:text-ink">Guides</Link>
            </nav>
            <div className="mt-6 flex items-center gap-3 text-sm text-steel">
              <span>{g.category}</span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="h-3.5 w-3.5" /> {g.readMinutes} min read, updated {g.updated}
              </span>
            </div>
            <h1 className="mt-5 text-balance text-[36px] font-medium leading-[1.08] sm:text-[48px] sm:tracking-[-0.02em]">{g.title}</h1>
            <p className="mt-5 text-xl leading-relaxed text-ink-4">{g.description}</p>
            </div>
            {cover && (
              <figure className="hidden lg:block">
                <div className="relative aspect-square rounded-3xl bg-paper-2/70 shadow-[inset_0_0_0_1px_var(--color-line)]">
                  <Image src={cover.src} alt={cover.alt} fill sizes="320px" preload className="object-contain p-10" />
                </div>
                {cover.part && <figcaption className="mt-2 text-center text-xs text-steel">{cover.part}</figcaption>}
              </figure>
            )}
          </Container>
        </header>

        <Container className="grid max-w-6xl gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <div className="mb-10">
              <AskQuestion variant="panel" topic={g.shortTitle} />
            </div>
            <div className="mb-10 rounded-2xl bg-paper-2 p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="text-sm text-steel">Key takeaways</div>
              <ul className="mt-3 space-y-2">
                {g.keyTakeaways.map((k) => (
                  <li key={k} className="flex gap-3 text-ink">
                    <span className="mt-[11px] h-px w-2 shrink-0 bg-steel" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <GuideBlocks blocks={g.body} />
            {buy && (
              <a
                href={buy.href}
                target="_blank"
                rel="noopener"
                className="group mt-10 flex items-center justify-between gap-4 rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
              >
                <span>
                  <span className="block text-sm text-steel">Ready to choose?</span>
                  <span className="mt-1 block text-lg font-medium">{buy.label}</span>
                  <span className="text-xs text-steel">at {SHOP_DOMAIN}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-steel transition-colors group-hover:text-ink" />
              </a>
            )}
            <div className="mt-12">
              <h2 className="mb-5 text-2xl font-medium">FAQ</h2>
              <Faq items={g.faqs} />
            </div>
          </div>

          <aside>
            {buy && (
              <div className="mb-4 rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="text-sm text-steel">Where to buy</div>
                <a href={buy.href} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1.5 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                  {buy.label} <ArrowRight className="h-4 w-4" />
                </a>
                <div className="mt-1 text-xs text-steel">at {SHOP_DOMAIN}</div>
              </div>
            )}
            {related.length > 0 && (
              <div className="mb-4 rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="text-sm text-steel">Related product types</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {related.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/types/${t.slug}`} className="text-ink-4 transition-colors hover:text-ink">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <div className="text-sm text-steel">Compare brands</div>
              <ul className="mt-3 space-y-2 text-sm">
                {popularPairs.slice(0, 3).map(([x, y]) => (
                  <li key={pairSlug(x, y)}>
                    <Link href={`/compare/${pairSlug(x, y)}`} className="text-ink-4 transition-colors hover:text-ink">
                      {getBrand(x)!.name} vs {getBrand(y)!.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/compare" className="text-ink-4 transition-colors hover:text-ink">
                    All brands side by side
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </Container>
      </article>

      <section className="border-t border-line bg-paper-2/50 py-14">
        <Container>
          <h2 className="text-2xl font-medium">More guides</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {more.map((m, i) => (
              <GuideCard key={m.slug} g={m} index={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
