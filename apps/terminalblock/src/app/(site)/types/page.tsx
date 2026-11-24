import type { Metadata } from "next";
import { productTypes } from "@/data/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { TypeCard } from "@/components/home/TypesGrid";
import { Container } from "@/components/ui/Section";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Terminal block types",
  description: "Push-in, spring, screw, ground, fuse, disconnect, multi-level, PCB terminal blocks and accessories — what each is for and how to choose.",
};

export default function TypesPage() {
  return (
    <>
      <PageHeader
        code="TY"
        eyebrow="Product types"
        title="Every kind of terminal block, explained in a minute"
        lede="Pick a type to see what it's for, what to watch out for, and typical specs — then request a quote for exactly what you need."
        image="header-types"
        imagePosition="center"
      />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {productTypes.map((t) => (
              <TypeCard key={t.slug} t={t} />
            ))}
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
