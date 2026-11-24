import { ClipboardList, Inbox, Search } from "lucide-react";
import { Container, Marker, SectionHeading } from "@/components/ui/Section";

const steps = [
  {
    code: "TB-01",
    icon: ClipboardList,
    title: "Tell us what you need",
    text: "Part numbers, a BOM, a datasheet or a photo of the label. Any format works.",
  },
  {
    code: "TB-02",
    icon: Search,
    title: "We identify and source",
    text: "The desk identifies each line, checks stock and equivalents across manufacturers, and flags anything that needs a second look.",
  },
  {
    code: "TB-03",
    icon: Inbox,
    title: "Compare one reply",
    text: "You get the options with price and lead time in one organized response. Order only if it works for you.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="One request in, one organized reply out"
          lede="Like a terminal strip for your sourcing: one input on your side, every supplier on the other."
        />

        <ol className="mt-16 grid border-t border-line md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.code} className={i > 0 ? "border-line pt-8 md:border-l md:pl-8 md:pt-8" : "pt-8 md:pr-8"}>
              <div className="flex items-center gap-3">
                <Marker>{s.code}</Marker>
                <s.icon className="h-[18px] w-[18px] text-steel" />
              </div>
              <h3 className="mt-6 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-ink-4">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
