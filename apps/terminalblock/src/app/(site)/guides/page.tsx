import type { Metadata } from "next";
import { getPublishedGuides } from "@/server/content/published";
import { GuideCard } from "@/components/guides/GuideCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";
import { GuideOffer } from "@/components/leads/GuideOffer";

export const metadata: Metadata = {
  title: "Terminal block guides",
  description: "Short, practical guides to selecting, sizing and sourcing terminal blocks.",
};

export default async function GuidesPage() {
  const guides = await getPublishedGuides();
  return (
    <>
      <PageHeader
        code="GD"
        eyebrow="Guides"
        title="Short answers to real buyer questions"
        lede="Concise, technically checked guides for engineers, panel builders and buyers. Read in under five minutes."
        image="header-guides"
        imagePosition="center 30%"
      />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="mb-12">
            <GuideOffer />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((g, i) => (
              <GuideCard key={g.slug} g={g} index={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
