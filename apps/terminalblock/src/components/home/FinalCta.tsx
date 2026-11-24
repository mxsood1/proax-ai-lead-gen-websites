import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export function FinalCta() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-balance text-[32px] font-medium leading-[1.1] sm:text-[40px] sm:tracking-[-0.02em]">
              Got a BOM? Get the whole strip quoted
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-4">
              Blocks, jumpers, end plates, markers and rail in one request and one reply.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/rfq" size="lg">
              Start your RFQ <ArrowRight className="h-[18px] w-[18px]" />
            </ButtonLink>
            <ButtonLink href="/rfq#bom" variant="outline" size="lg">
              <FileSpreadsheet className="h-[18px] w-[18px]" /> Upload a BOM
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
