import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { site } from "@/config/site";
import { config } from "@/server/config";
import type { Lead } from "@/server/leads/types";

/**
 * Emails sent TO the visitor (the guide download link).
 * Default: written to .data/outbox/ (nobody is emailed). Real delivery only when EMAIL_DELIVERY=on
 * and Resend is configured. Only ever sent to the address the visitor typed into the form.
 */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const base = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const footer = `${site.name} · Terminal block brands compared side by side. You're receiving this because you asked for it on ${site.domain}.`;

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f3ec;font-family:Arial,sans-serif;color:#1b1915;font-size:15px;line-height:1.55">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-family:monospace;font-size:12px;color:#5e554a;margin:0 0 16px">${esc(site.name)}</p>
<h1 style="font-size:22px;font-weight:600;margin:0 0 16px">${esc(title)}</h1>
${bodyHtml}
<p style="font-size:12px;color:#7b7266;margin-top:32px;border-top:1px solid #e0d9cc;padding-top:16px">${esc(footer)}</p>
</div></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#c2410c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${esc(label)}</a></p>`;

export function renderGuideEmail(lead: Lead, guideTitle: string, link: string) {
  const subject = `Your ${guideTitle}`;
  const text = [`Hi${lead.contact.name ? ` ${lead.contact.name}` : ""},`, "", `Here is your copy of the ${guideTitle}:`, link, "", "The link works for 7 days.", "", `Comparing brands? See them side by side: ${base()}/compare`, "", footer].join("\n");
  const html = layout(
    `Your ${guideTitle}`,
    `<p>Hi${lead.contact.name ? ` ${esc(lead.contact.name)}` : ""},</p><p>Here is your copy. The link works for 7 days.</p>${button(link, "Download the guide (PDF)")}<p>Comparing brands? <a href="${esc(base())}/compare" style="color:#c2410c">See them side by side</a>, or reply to this email with your question.</p>`,
  );
  return { subject, text, html };
}

export function renderComparisonEmail(lead: Lead, title: string, link: string, pageUrl: string) {
  const subject = `Your comparison: ${title}`;
  const text = [
    `Hi${lead.contact.name ? ` ${lead.contact.name}` : ""},`,
    "",
    `Here is your PDF of ${title}:`,
    link,
    "",
    "The link works for 7 days. The latest version is always on the site:",
    pageUrl,
    "",
    "Have a question about a specific part? Reply to this email.",
    "",
    footer,
  ].join("\n");
  const html = layout(
    `Your comparison: ${title}`,
    `<p>Hi${lead.contact.name ? ` ${esc(lead.contact.name)}` : ""},</p><p>Here is your PDF. The link works for 7 days.</p>${button(link, "Download the comparison (PDF)")}<p>The latest version is always on the site: <a href="${esc(pageUrl)}" style="color:#c2410c">${esc(title)}</a>. Have a question about a specific part? Just reply to this email.</p>`,
  );
  return { subject, text, html };
}

export async function sendBuyerEmail(lead: Lead, msg: { subject: string; text: string; html: string }): Promise<{ delivered: boolean; where: string }> {
  if (!config.email.deliver) {
    const dir = path.join(config.dataDir, "outbox");
    await mkdir(dir, { recursive: true });
    const name = `${lead.ref}-to-buyer`;
    await writeFile(path.join(dir, `${name}.html`), msg.html, "utf8");
    await writeFile(path.join(dir, `${name}.txt`), `To: ${lead.contact.email}\nSubject: ${msg.subject}\n\n${msg.text}`, "utf8");
    return { delivered: false, where: `outbox/${name}.html` };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.email.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.email.from, to: [lead.contact.email], subject: msg.subject, text: msg.text, html: msg.html }),
  });
  if (!res.ok) throw new Error(`Buyer email failed (${res.status})`);
  return { delivered: true, where: "email" };
}
