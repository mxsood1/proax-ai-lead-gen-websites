import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { getPublishedGuides } from "@/server/content/published";
import { homeFaqs } from "@/data/faq";
import { Hero } from "@/components/home/Hero";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ToolsGrid } from "@/components/home/ToolsGrid";
import { TypesGrid } from "@/components/home/TypesGrid";
import { OldWayNewWay } from "@/components/home/OldWayNewWay";
import { FinalCta } from "@/components/home/FinalCta";
import { FeaturedSupplier } from "@/components/home/FeaturedSupplier";
import { GuideCard } from "@/components/guides/GuideCard";
import { GuideOffer } from "@/components/leads/GuideOffer";
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
          "@type": "Organization",
          name: site.name,
          url: site.url,
          description: site.description,
          areaServed: "CA",
        }}
      />
      <Hero />
      <BrandsMarquee />
      <HowItWorks />
      <ToolsGrid />
      <TypesGrid />
      <OldWayNewWay />
      <FeaturedSupplier />

      <section className="border-t border-line bg-paper-2/50 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Latest guides" title="Short answers to real buyer questions" lede="Practical guides you can read in under five minutes." />
            <ButtonLink href="/guides" variant="outline" className="shrink-0">
              All guides <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {latest.map((g, i) => (
              <GuideCard key={g.slug} g={g} index={i} />
            ))}
          </div>
          <div className="mt-12">
            <GuideOffer />
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQ" title="Questions buyers ask first" lede="Can't find your answer? Add it to the notes of your RFQ. A person reads every one." />
          <Faq items={homeFaqs} />
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
