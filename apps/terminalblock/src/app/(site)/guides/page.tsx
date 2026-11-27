import type { Metadata } from "next";
import { getPublishedGuides } from "@/server/content/published";
import { GuideCard } from "@/components/guides/GuideCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";
import { AskQuestion } from "@/components/leads/AskQuestion";

export const metadata: Metadata = {
  title: "Terminal block guides",
  description: "Brand comparisons and practical guides to choosing and sizing terminal blocks.",
};

export default async function GuidesPage() {
  const guides = await getPublishedGuides();
  return (
    <>
      <PageHeader
        code="GD"
        eyebrow="Guides"
        title="Brand comparisons and plain answers"
        lede="How the major brands compare, and the selection questions engineers and panel builders ask most. Read in under five minutes."
        image="header-guides"
        imagePosition="center 30%"
      />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="mb-12">
            <AskQuestion variant="panel" />
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
