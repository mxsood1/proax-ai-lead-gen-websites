import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { getPublishedGuides } from "@/server/content/published";
import { homeFaqs } from "@/data/faq";
import { getBrand, pairSlug, popularPairs } from "@/data/brands";
import { Hero } from "@/components/home/Hero";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TypesGrid } from "@/components/home/TypesGrid";
import { GuideCard } from "@/components/guides/GuideCard";
import { Faq } from "@/components/ui/Faq";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function HomePage() {
  const latest = (await getPublishedGuides()).slice(0, 3);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: site.description,
        }}
      />
      <Hero />
      <BrandsMarquee />

      <section className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Compare brands"
              title="Side by side, like comparing phones"
              lede="Pick two brands and see their ranges for every kind of terminal block, with strengths and things to check for each."
            />
            <ButtonLink href="/compare" variant="outline" className="shrink-0">
              All brands <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="border-t border-line">
        <HowItWorks />
      </div>
      <TypesGrid />

      <section className="border-t border-line bg-paper-2/50 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Latest guides" title="Plain answers to the questions engineers ask" lede="Comparisons and how-tos you can read in under five minutes." />
            <ButtonLink href="/guides" variant="outline" className="shrink-0">
              All guides <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {latest.map((g, i) => (
              <GuideCard key={g.slug} g={g} index={i} />
            ))}
          </div>

        </Container>
      </section>

      <section className="border-t border-line py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQ" title="Common questions" lede="Can't find your answer? Ask us below. A person reads every question." />
          <Faq items={homeFaqs} />
        </Container>
      </section>
    </>
  );
}
