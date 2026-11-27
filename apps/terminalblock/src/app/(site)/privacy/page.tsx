import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  // Canadian privacy law (PIPEDA) requires naming the organisation responsible. Set site.legal before launch.
  const who = site.legal.entity || "[Organisation name to be confirmed before launch]";
  const contact = site.legal.contactEmail || "[privacy contact email to be confirmed before launch]";
  return (
    <LegalPage title="Privacy policy">
      <p>
        {site.name} is operated by {who} (&quot;we&quot;), which is responsible for the personal information you send through this site. This policy
        explains what we collect and how we use it. We follow Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA).
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Questions you send through the &quot;Ask us your question&quot; form, and the page you asked from.</li>
        <li>Contact details you give us: email, and optionally name, company and role.</li>
        <li>Your email and company when you download a guide.</li>
        <li>Basic, privacy-friendly site analytics such as pages visited and referring search terms.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To answer your question or send you the guide you asked for.</li>
        <li>To send you new comparisons and guides, only if you ticked the box to receive them.</li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your information.</li>
        <li>We don&apos;t send marketing email unless you opt in (CASL), and you can unsubscribe at any time.</li>
      </ul>
      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete your information at any time by writing to {contact}.</p>
    </LegalPage>
  );
}
