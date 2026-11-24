# Exact-part images (Finder and part pages)

Transparent PNG images of specific catalog parts, shown on the Finder result cards and in the RFQ tray. Each image is the manufacturer catalog image from that part's public product page on the featured supplier's website, matched by manufacturer part number. The white background was removed, and the image trimmed and resized to at most 480 px.

- **Rights:** confirmed by Proax marketing (2026-11-24). Proax has rights to use product images of the lines it supplies from its vendors.
- **Mapping:** `src/data/part-images.json` maps each catalog item's id to its image. Several parts can share one image (for example, colour variants the manufacturer photographs once).
- **Parts with no image** (no product page, or only a placeholder image) keep the drawn block. Nothing breaks if a file is missing; the card simply shows the drawing.
- **Refreshing after a new catalog export:** re-run the part-image script (match the catalog to the product sitemap, fetch the images, build the cut-outs). It only reads public product pages that the site's robots.txt allows, one request at a time.
