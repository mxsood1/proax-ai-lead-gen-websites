# Brand logos for the homepage strip

Logos in this folder appear automatically in the sliding "Brands we compare" strip. Brands without a file show their name as a wordmark. Each logo is sized automatically so they all carry similar visual weight.

## Current files

Downloaded from Wikimedia Commons as PNG renderings, then trimmed to the artwork. All are company trademarks, shown only to identify the brands the site compares.

| Brand | File | Commons source | Licence on Commons |
| --- | --- | --- | --- |
| Phoenix Contact | `phoenix-contact.png` | File:Phoenix Contact Logo.svg | Public domain (text logo) |
| WAGO | `wago.png` | File:Logo WAGO 2020.svg | Public domain (text logo) |
| Weidmüller | `weidmuller.png` | File:Weidmüller.svg | Public domain (text logo) |
| ABB | `abb.png` | File:ABB logo.svg | Public domain (text logo) |
| Allen-Bradley | `allen-bradley.png` | File:Allen-Bradley logo.svg | Public domain (text logo) |
| Eaton | `eaton.png` | File:Eaton Corporation Logo.svg | Public domain (text logo) |
| Siemens | `siemens.png` | File:Siemens AG logo.svg | Public domain (text logo) |
| Schneider Electric | `schneider-electric.png` | File:Schneider Electric 2007.svg | Public domain (text logo) |
| Wieland Electric | `wieland.png` | File:Wieland-Logo.svg | Public domain (text logo) |

Not on Commons, so they still show as wordmarks: **Altech** (`altech.png`), **Dinkle** (`dinkle.png`), **IDEC** (`idec.png`). Get these from the manufacturers' press pages.

## Turning logos off

To show plain brand names instead of logos, set `showBrandLogos: false` in `src/config/site.ts`. The list of brands is `stripBrands` in `src/data/brands.ts`.

## Adding or replacing a logo

- Name the file after the brand as above. `.png` (transparent background) is best; `.webp` and `.svg` also work.
- Restart the dev server (logo sizes are worked out once and cached); no code changes needed.
- To change the list of brands, edit `stripBrands` in `src/data/brands.ts`.
