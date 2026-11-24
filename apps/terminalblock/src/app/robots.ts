import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Pre-launch: block all crawlers. Flip `launched` to true when the site is approved to go live.
const launched = false;

export default function robots(): MetadataRoute.Robots {
  return launched
    ? { rules: { userAgent: "*", allow: "/", disallow: ["/desk", "/api"] }, sitemap: `${site.url}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
