# Brand logos for the homepage strip

Logos in this folder appear automatically in the sliding "Brands our sourcing desk works with" strip. Brands without a file show their name as a wordmark. Each logo is sized automatically so they all carry similar visual weight.

## Current files

Downloaded from Wikimedia Commons as PNG renderings, then trimmed to the artwork. All are company trademarks; use them only for lines Proax actually supplies.

| Brand | File | Commons source | Licence on Commons |
| --- | --- | --- | --- |
| Phoenix Contact | `phoenix-contact.png` | File:Phoenix Contact Logo.svg | Public domain (text logo) |
| WAGO | `wago.png` | File:Logo WAGO 2020.svg | Public domain (text logo) |
| Weidmüller | `weidmuller.png` | File:Weidmüller.svg | Public domain (text logo) |
| ABB (Entrelec) | `abb-entrelec.png` | File:ABB logo.svg | Public domain (text logo) |
| Allen-Bradley | `allen-bradley.png` | File:Allen-Bradley logo.svg | Public domain (text logo) |
| Eaton | `eaton.png` | File:Eaton Corporation Logo.svg | Public domain (text logo) |
| Siemens | `siemens.png` | File:Siemens AG logo.svg | Public domain (text logo) |
| Schneider Electric | `schneider-electric.png` | File:Schneider Electric 2007.svg | Public domain (text logo) |
| Wieland Electric | `wieland.png` | File:Wieland-Logo.svg | Public domain (text logo) |

Not on Commons, so they still show as wordmarks: **Altech** (`altech.png`), **Dinkle** (`dinkle.png`), **IDEC** (`idec.png`). Get these from Proax marketing or the manufacturers' press pages.

## Before launch: check with Proax marketing

Proax has its own agreements with these manufacturers, and some agreements control where and how a brand's logo may appear. Before this site goes live, have Proax marketing confirm the list and the logos. Until then:

- To show plain brand names instead of logos, set `showBrandLogos: false` in `src/config/site.ts`.
- To drop a brand entirely, remove it from `brandsWeSource` in the same file.

## Adding or replacing a logo

- Name the file after the brand as above. `.png` (transparent background) is best; `.webp` and `.svg` also work.
- Restart the dev server (logo sizes are worked out once and cached); no code changes needed.
- To change the list of brands, edit `brandsWeSource` in `src/config/site.ts`.
