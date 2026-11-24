import { Container } from "@/components/ui/Section";

/** Instant placeholder shown while a detail page streams in. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <section className="blueprint">
        <Container className="py-16 sm:py-20">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-5 w-1/2 max-w-md animate-pulse rounded bg-white/10" />
        </Container>
      </section>
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {[100, 92, 96, 70].map((w, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-paper-3" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-paper-2" />
      </Container>
    </div>
  );
}
