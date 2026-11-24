import type { ReactNode } from "react";
import { Badge, Container } from "@/components/ui/Section";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="paper-grid py-14 sm:py-20">
      <Container className="max-w-3xl">
        <Badge tone="demo">Draft — to be reviewed before launch</Badge>
        <h1 className="mt-5 text-4xl font-medium sm:text-5xl">{title}</h1>
        <div className="prose-tb mt-10 rounded-3xl border border-line bg-paper p-6 sm:p-10">{children}</div>
      </Container>
    </section>
  );
}
