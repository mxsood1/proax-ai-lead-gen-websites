import type { Metadata } from "next";
import { Finder } from "@/components/finder/Finder";
import { getCatalog } from "@/data/catalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Terminal block finder",
  description: "Filter terminal blocks by wire size, current, connection type and function, then request a quote for the matches in one click.",
};

export default function FinderPage() {
  return (
    <>
      <PageHeader
        code="T1"
        eyebrow="Free tool · Terminal block finder"
        title="Find the right terminal block"
        lede="Pick your wire size, current and connection style. Add the matches to your RFQ and we'll source them — any brand."
        image="header-finder"
        imagePosition="center 40%"
      />
      <section className="py-12 pb-32">
        <Container>
          <Finder catalog={getCatalog()} />
        </Container>
      </section>
    </>
  );
}
