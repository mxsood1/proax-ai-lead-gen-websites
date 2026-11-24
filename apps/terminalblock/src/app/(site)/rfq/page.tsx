import type { Metadata } from "next";
import { Suspense } from "react";
import { RfqForm } from "@/components/rfq/RfqForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Request a quote for terminal blocks",
  description: "Submit one RFQ for terminal blocks — part numbers, a BOM or a photo — and get sourcing options from one desk. Free, no obligation.",
};

export default function RfqPage() {
  return (
    <>
      <PageHeader
        code="RFQ"
        eyebrow="Request for quote · free, no obligation"
        title="One request, every supplier"
        lede="Tell us what you need in whatever format you have it. Takes about two minutes."
        rail={["grey", "grey", "grey", "blue", "ground", "orange"]}
      />
      <section className="py-12 sm:py-16">
        <Container>
          <Suspense fallback={<div className="h-[600px] animate-pulse rounded-3xl bg-paper-2" />}>
            <RfqForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
