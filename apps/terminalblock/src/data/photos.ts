/**
 * Real product images used on the site: manufacturer catalog photos of
 * specific parts, cut out onto a transparent background (see
 * public/photos/README.md). Each entry records the exact part shown so the
 * site can caption it with the exact part.
 */
import data from "./photos.json";

export type PhotoCredit = {
  title: string;
  page: string;
  license: string;
  licenseUrl: string;
  artist: string;
};

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  cropped: boolean;
  /** Transparent product cut-out (shown whole, never cropped) */
  cutout?: boolean;
  /** The exact part shown, e.g. "Phoenix Contact PT 2,5" */
  part?: string;
  /** Manufacturer item number(s) of the part shown */
  number?: string;
  /** Background photo for a page header (shown under a colour tint) */
  background?: boolean;
};

const photos = data.photos as Record<string, Photo>;
export const photoCredits = data.credits as Record<string, PhotoCredit>;

export function getPhoto(id: string): Photo | null {
  return photos[id] ?? null;
}

/** Product images that can be placed inside articles (cut-outs, not page-header scenes). */
export function articleImages() {
  return Object.entries(photos)
    .filter(([, p]) => p.cutout)
    .map(([id, p]) => ({ id, part: p.part ?? "", alt: p.alt }));
}

/** Every photo with its credit, for the credits page. */
export function allPhotos() {
  return Object.entries(photos).map(([id, p]) => ({ id, ...p, info: photoCredits[p.credit] }));
}
