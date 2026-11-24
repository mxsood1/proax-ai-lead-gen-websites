import "server-only";
import { cacheTag } from "next/cache";
import { guides as staticGuides, type Guide } from "@/data/guides";
import { config } from "@/server/config";
import { isPublishable, listDrafts } from "./store";

/** Cache tag for everything built from the published article list. */
export const GUIDES_TAG = "guides";

/**
 * Guides visible on the public site: the hand-written ones, plus approved
 * articles ONLY when CONTENT_PUBLISHING=on (off by default).
 *
 * Cached, so pages stay fast. Approving, editing or unpublishing an article
 * expires the "guides" tag, so the change shows on the next request without
 * a rebuild.
 */
export async function getPublishedGuides(): Promise<Guide[]> {
  "use cache";
  cacheTag(GUIDES_TAG);
  if (!config.content.publishing) return staticGuides;
  const approved = (await listDrafts()).filter(isPublishable).map((d) => d.guide);
  const slugs = new Set(staticGuides.map((g) => g.slug));
  // Newest first, so the latest article leads the guides page and the homepage
  const day = (g: Guide) => g.published ?? g.updated;
  return [...staticGuides, ...approved.filter((g) => !slugs.has(g.slug))].sort((a, b) => day(b).localeCompare(day(a)));
}

export async function getPublishedGuide(slug: string) {
  return (await getPublishedGuides()).find((g) => g.slug === slug);
}
