import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>{site.name} publishes comparisons and guides about terminal blocks. By using this site you agree to these terms.</p>
      <h2>Information on this site</h2>
      <p>
        Comparisons, product information and guides are provided for general guidance, based on information published by the manufacturers. Ranges
        and ratings change: always confirm specifications, ratings and approvals against the manufacturer&apos;s current datasheet before ordering or
        installing.
      </p>
      <h2>Questions</h2>
      <p>Answers to questions sent through the site are general guidance, not engineering approval for a specific installation.</p>
      <h2>Trademarks</h2>
      <p>
        Manufacturer names, logos and product names are trademarks of their respective owners and are used only to identify products. Showing a brand
        does not mean the manufacturer endorses, sponsors or is affiliated with this site.
      </p>
    </LegalPage>
  );
}
