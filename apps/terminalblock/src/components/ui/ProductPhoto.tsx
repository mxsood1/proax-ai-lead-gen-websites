import Image from "next/image";
import type { Photo } from "@/data/photos";
import { cn } from "@/lib/cn";

/**
 * A real product image. Cut-outs (transparent PNGs) are shown whole inside
 * their box; ordinary photos fill the box and are cropped to fit.
 */
export function ProductPhoto({
  photo,
  sizes,
  preload,
  className,
  position = "center",
}: {
  photo: Photo;
  sizes: string;
  preload?: boolean;
  className?: string;
  position?: string;
}) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      preload={preload}
      className={cn("h-full w-full", photo.cutout ? "object-contain" : "object-cover", className)}
      style={{ objectPosition: position }}
    />
  );
}
