import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { productTypes } from "@/data/types";
import { EditForm } from "@/components/desk/ContentForms";
import { requireDesk } from "@/server/auth/session";
import { getDraft } from "@/server/content/store";
import { blocksToText, faqsToText } from "@/server/content/markdown";

export default function EditDraftPage({ params }: PageProps<"/desk/content/[id]/edit">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-2" />}>
      <EditDraft params={params} />
    </Suspense>
  );
}

async function EditDraft({ params }: { params: PageProps<"/desk/content/[id]/edit">["params"] }) {
  await requireDesk();
  const { id } = await params;
  const d = await getDraft(id);
  if (!d) notFound();
  const g = d.guide;

  return (
    <div className="space-y-6">
      <Link href={`/desk/content/${d.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-4 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to the article
      </Link>
      <div>
        <h1 className="text-[32px] font-medium leading-tight">Edit article</h1>
        <p className="mt-1 text-ink-4">
          /guides/{g.slug}
          {d.status === "approved" ? " · This article is approved, so saved changes go live straight away when publishing is on." : ""}
        </p>
      </div>
      <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8">
        <EditForm
          types={productTypes.map((t) => ({ slug: t.slug, name: t.name }))}
          v={{
            id: d.id,
            title: g.title,
            shortTitle: g.shortTitle,
            description: g.description,
            category: g.category,
            readMinutes: g.readMinutes,
            takeaways: g.keyTakeaways.join("\n"),
            body: blocksToText(g.body),
            faqs: faqsToText(g.faqs),
            related: g.related ?? [],
          }}
        />
      </div>
    </div>
  );
}
