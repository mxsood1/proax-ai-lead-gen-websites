import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        {site.name} is an industrial sourcing service. Quotes and orders placed through it are with our featured supplier, {site.operator}. By using
        this site you agree to these terms.
      </p>
      <h2>Information on this site</h2>
      <p>
        Product information, guides and tool results are provided for general guidance. Always confirm specifications, ratings and approvals against the
        manufacturer&apos;s datasheet before ordering or installing. AI-generated suggestions are verified by our team before quoting.
      </p>
      <h2>Quotes</h2>
      <p>Submitting an RFQ is free and creates no obligation. Quotes are subject to the terms stated on the quote itself.</p>
      <h2>Trademarks</h2>
      <p>
        Manufacturer names, logos and product names are trademarks of their respective owners and are used only to identify products. Showing a brand
        does not mean the manufacturer endorses, sponsors or is affiliated with this site, or that any supplier is an authorized distributor of it.
      </p>
    </LegalPage>
  );
}
