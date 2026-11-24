import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Bot, Eye, ShieldCheck, UserCheck } from "lucide-react";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "How it works",
  description: `How ${site.name} sources terminal blocks for Canadian buyers — who we are, how we use AI, and how we handle your information.`,
};

const principles = [
  { icon: Bot, title: "AI does the legwork", text: "AI reads your BOMs and photos, identifies parts and suggests equivalents — so your request is organized before a person even opens it." },
  { icon: UserCheck, title: "People make the call", text: "Every match and substitution is verified by our sourcing team. Nothing is swapped without your approval." },
  { icon: Eye, title: "Clear about who quotes", text: `Every quote comes from our featured supplier, ${site.featuredSupplier.name}. You always know who you're buying from.` },
  { icon: ShieldCheck, title: "Your data stays yours", text: "Your contact details are never sold or passed to third parties. Suppliers see part details only, not who you are, unless you ask us to share." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        code="HW"
        eyebrow="How it works"
        title="A sourcing desk, not a marketplace"
        lede="You send one request. We find the parts, check the equivalents and come back with one organized answer."
        image="header-how"
        imagePosition="center 45%"
      />
      <HowItWorks />
      <section className="border-t border-line py-24">
        <Container>
          <SectionHeading eyebrow="Principles" title="How we work" />
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
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              {/* The logo's colours are dark, so it sits on a light tile */}
              <div className="flex shrink-0 items-center justify-center rounded-2xl bg-white px-6 py-5">
                <Image
                  src={site.featuredSupplier.logo.src}
                  alt={site.featuredSupplier.name}
                  width={site.featuredSupplier.logo.width}
                  height={site.featuredSupplier.logo.height}
                  className="h-auto w-[150px]"
                />
              </div>
              <div>
                <p className="text-sm text-white/45">Featured supplier</p>
                <h2 className="mt-1 text-2xl font-medium">{site.featuredSupplier.name}</h2>
                <p className="mt-2 max-w-2xl text-white/65">
                  Quotes, orders and support for requests sent through {site.name} are handled by {site.featuredSupplier.name}, a{" "}
                  {site.featuredSupplier.blurb}.{" "}
                  <a href={site.featuredSupplier.url} target="_blank" rel="noopener" className="underline hover:text-white">
                    Visit {site.featuredSupplier.name}
                  </a>
                </p>
              </div>
            </div>
            <ButtonLink href="/rfq" size="lg" className="shrink-0">
              Start an RFQ <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
