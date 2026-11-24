# Product images

Transparent PNG cut-outs of real Phoenix Contact parts, used in the homepage hero, the product type cards and each type page. Phoenix Contact accounts for most of the catalog (957 of 1,231 items), so the images match what buyers will actually be quoted.

- **Source:** Phoenix Contact catalog images, as published on the public product pages of the featured supplier's website. The white studio background was removed and the images trimmed; nothing else was changed.
- **Rights:** confirmed by Proax marketing (2026-11-24). Proax has rights to use product images of the lines it supplies from its vendors.
- **Data:** `src/data/photos.json` holds each image's size, alt text and the exact part shown (name and item number). Type pages caption the part and link straight to a quote for it.
- **File names:** each file is named after its product type slug (`fuse.png` → `/types/fuse`); `hero-*.png` are the three homepage blocks.
- **No image yet:** barrier strips. They aren't in the featured supplier's online catalog and no clean freely licensed photo exists, so that type keeps its drawn illustration.

## Adding or replacing an image

1. Start from a product photo on a plain white background (manufacturer catalog images work best), about 800 px or larger.
2. Remove the background so it's a transparent PNG, trim the empty edges, and save it as `public/photos/<type-slug>.png`.
3. Add or update its entry in `src/data/photos.json`: size, alt text, `"cutout": true`, part name and item number.
4. Restart the dev server.
