import type { Metadata } from "next";
import { ArrowRight, BookOpen, MessageCircle, Scale, ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "How we compare",
  description: `How ${site.name} compares terminal block brands: where the information comes from, how every brand is treated, and how to ask a question.`,
};

const principles = [
  { icon: BookOpen, title: "Facts from the source", text: "Product families, functions and ratings come from the manufacturers' own catalogues and datasheets. Where we're not sure, we say so rather than guess." },
  { icon: Scale, title: "Every brand, the same way", text: "Each brand gets its strengths and the things to check. No brand is declared best for every job, because none is." },
  { icon: ShieldCheck, title: "No paid placement", text: "Manufacturers don't pay to be listed, ranked or reviewed. Logos and names are shown only to identify products." },
  { icon: MessageCircle, title: "A person answers questions", text: "Questions sent through the site are read and answered by a person who works with terminal blocks, not by a chatbot." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="How we compare"
        title="Helping you pick the right terminal block, whatever the brand"
        lede={`${site.name} compares the major terminal block brands side by side and explains the choices in plain language, for engineers, panel builders and buyers.`}
        image="header-how"
        imagePosition="center 45%"
      />
      <HowItWorks />
      <section className="border-t border-line py-24">
        <Container>
          <SectionHeading eyebrow="Principles" title="What you can expect" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line bg-paper p-7">
                <p.icon className="h-[18px] w-[18px] text-steel" />
                <h3 className="mt-5 text-xl font-medium">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-4">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="pb-24">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-medium">Comparing two brands right now?</h2>
              <p className="mt-2 max-w-2xl text-white/65">See their ranges for every kind of terminal block, side by side, with strengths and things to check for each.</p>
            </div>
            <ButtonLink href="/compare" size="lg" className="shrink-0">
              Compare brands <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
