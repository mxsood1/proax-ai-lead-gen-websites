import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        Requests sent through {site.name} are received and handled by our featured supplier, {site.operator} (&quot;we&quot;), which is responsible for
        the personal information you submit here. This policy explains what we collect when you use this site and how we use it. We follow Canada&apos;s
        Personal Information Protection and Electronic Documents Act (PIPEDA).
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Details you submit in an RFQ: part numbers, quantities, notes and any files you upload.</li>
        <li>Contact details: name, company, email and (optionally) phone.</li>
        <li>Basic, privacy-friendly site analytics such as pages visited and referring search terms.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To identify the parts you need and prepare a quote.</li>
        <li>To contact you about your request.</li>
        <li>To share part details — not your contact details — with suppliers when obtaining pricing.</li>
        <li>We use AI tools to read files and suggest matches. A person reviews the results.</li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your information.</li>
        <li>We don&apos;t send marketing email unless you opt in (CASL).</li>
      </ul>
      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete your information at any time. Contact details will be added here before launch.</p>
    </LegalPage>
  );
}
