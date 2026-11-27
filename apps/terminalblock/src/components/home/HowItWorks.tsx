import { BookOpen, Columns2, Scale } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Section";

const steps = [
  {
    icon: BookOpen,
    title: "Start from the manufacturer's own data",
    text: "Product families, functions and ratings come from catalogues and datasheets, not from marketing claims.",
  },
  {
    icon: Columns2,
    title: "Compare like with like",
    text: "Brands are compared by kind of block: push-in against push-in, fuse against fuse, so you see what each one actually offers.",
  },
  {
    icon: Scale,
    title: "Strengths and things to check, for every brand",
    text: "No brand is best for every job. Each one gets its strengths and the things to watch for, so you can decide for your panel.",
  },
];

/** How the comparisons are made (homepage and the About page). */
export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="How we compare"
          title="Facts first, every brand treated the same way"
          lede="The goal is simple: help you pick the right terminal block, whichever brand that turns out to be."
        />

        <ol className="mt-16 grid border-t border-line md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className={i > 0 ? "border-line pt-8 md:border-l md:pl-8 md:pt-8" : "pt-8 md:pr-8"}>
              <s.icon className="h-[18px] w-[18px] text-steel" />
              <h3 className="mt-5 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-ink-4">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
