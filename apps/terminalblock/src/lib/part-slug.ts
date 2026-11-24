/** URL slug for a part page: "Phoenix Contact" + "3044102" -> "phoenix-contact-3044102". */
export const slugPart = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const partSlug = (p: { manufacturer: string; partNumber: string }) => `${slugPart(p.manufacturer)}-${slugPart(p.partNumber)}`;
