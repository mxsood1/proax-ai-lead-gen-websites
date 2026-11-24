import { DinRail } from "@/components/brand/DinRail";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
    <section className="blueprint text-white">
      <Container className="flex flex-col items-center py-24 text-center">
        <div className="text-[12px]">
          <DinRail modules={[{ variant: "grey", label: "4" }, { variant: "dark", label: "0" }, { variant: "grey", label: "4" }]} />
        </div>
        <h1 className="mt-10 text-4xl font-medium sm:text-5xl">Open circuit</h1>
        <p className="mt-3 max-w-md text-white/65">This page isn&apos;t wired to anything. Let&apos;s get you back to a live terminal.</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/rfq" variant="outline-light">
            Start an RFQ
          </ButtonLink>
        </div>
      </Container>
    </section>
    </SiteChrome>
  );
}
