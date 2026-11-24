import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "@/server/config";
import type { Lead } from "@/server/leads/types";
import type { Draft } from "@/server/content/store";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function deskUrl(lead: Lead) {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/desk/leads/${lead.id}`;
}

export function renderLeadAlert(lead: Lead) {
  const tier = lead.analysis?.score.tier;
  const what = lead.kind === "guide" ? "Guide download" : lead.kind === "list" ? "Parts list emailed" : "New RFQ";
  const subject = `${tier === "hot" ? "[Hot] " : ""}${what} ${lead.ref} · ${lead.contact.company}${lead.kind === "guide" ? "" : ` · ${lead.lines.length} line${lead.lines.length === 1 ? "" : "s"}`}`;

  const lines = lead.lines
    .map((l, i) => `${i + 1}. ${l.part}${l.manufacturer ? ` (${l.manufacturer})` : ""}${l.qty ? ` × ${l.qty}` : ""}`)
    .join("\n");

  const text = [
    `New request ${lead.ref} from ${lead.site}`,
    "",
    `Company: ${lead.contact.company}`,
    `Contact: ${lead.contact.name} <${lead.contact.email}>${lead.contact.phone ? `, ${lead.contact.phone}` : ""}`,
    `Timing: ${lead.details.urgency || "not set"}   Equivalents: ${lead.details.equivalents || "not set"}   Ship to: ${lead.details.province || "not set"}`,
    "",
    "Lines:",
    lines || "(none, see attachments/notes)",
    lead.files.length ? `\nFiles: ${lead.files.map((f) => f.name).join(", ")}` : "",
    lead.details.notes ? `\nNotes:\n${lead.details.notes}` : "",
    lead.analysis ? `\nScore: ${lead.analysis.score.score}/100 (${lead.analysis.score.tier}). ${lead.analysis.summary}` : "",
    `\nOpen in the sourcing desk: ${deskUrl(lead)}`,
  ]
    .filter((s) => s !== "")
    .join("\n");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1b1915;font-size:14px;line-height:1.5">
<p style="font-family:monospace;color:#5e554a">${esc(lead.ref)} · ${esc(lead.site)}</p>
<h2 style="font-weight:500;margin:0 0 12px">${esc(lead.contact.company)}</h2>
<p>${esc(lead.contact.name)} &lt;${esc(lead.contact.email)}&gt;${lead.contact.phone ? `, ${esc(lead.contact.phone)}` : ""}</p>
<table cellpadding="6" style="border-collapse:collapse;border:1px solid #e0d9cc">
<tr style="background:#eee9df"><th align="left">Part</th><th align="left">Manufacturer</th><th align="right">Qty</th></tr>
${lead.lines.map((l) => `<tr><td style="font-family:monospace">${esc(l.part)}</td><td>${esc(l.manufacturer)}</td><td align="right">${l.qty ?? ""}</td></tr>`).join("")}
</table>
<p>Timing: ${esc(lead.details.urgency || "not set")} · Equivalents: ${esc(lead.details.equivalents || "not set")} · Ship to: ${esc(lead.details.province || "not set")}</p>
${lead.details.notes ? `<p style="white-space:pre-wrap;background:#f6f3ec;padding:8px">${esc(lead.details.notes)}</p>` : ""}
${lead.files.length ? `<p>Files: ${lead.files.map((f) => esc(f.name)).join(", ")}</p>` : ""}
${lead.analysis ? `<p><b>Score ${lead.analysis.score.score}/100 (${esc(lead.analysis.score.tier)})</b><br>${esc(lead.analysis.summary)}</p>` : ""}
<p><a href="${esc(deskUrl(lead))}">Open in the sourcing desk</a></p>
</body></html>`;

  return { subject, text, html };
}

/**
 * Delivers the alert. Default: writes it to .data/outbox/ (nobody is emailed).
 * Real delivery only when EMAIL_DELIVERY=on and Resend is configured.
 */
export async function sendLeadAlert(lead: Lead): Promise<{ delivered: boolean; where: string }> {
  return deliver({ key: lead.ref, ...renderLeadAlert(lead), replyTo: lead.contact.email });
}

/** Notice to the review team that a new article is waiting in the desk. */
export function renderDraftNotice(d: Draft) {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/desk/content/${d.id}`;
  const subject = `New article to review: ${d.guide.title}`;
  const text = [
    `A new ${d.source === "ai" ? "AI-written article" : "article outline"} is waiting for review on ${base.replace(/^https?:\/\//, "")}.`,
    "",
    `Title: ${d.guide.title}`,
    `Target search: ${d.keyword}`,
    `Claims to check: ${d.factCheck.length}`,
    "",
    "Nothing is published until someone checks the facts and approves it.",
    `Review it here: ${url}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1b1915;font-size:14px;line-height:1.5">
<p style="color:#5e554a">New article waiting for review</p>
<h2 style="font-weight:500;margin:0 0 12px">${esc(d.guide.title)}</h2>
<p>Target search: ${esc(d.keyword)}<br>Claims to check: ${d.factCheck.length}</p>
<p>Nothing is published until someone checks the facts and approves it.</p>
<p><a href="${esc(url)}">Review it in the desk</a></p>
</body></html>`;
  return { subject, text, html };
}

export async function sendDraftNotice(d: Draft) {
  return deliver({ key: `article-${d.id}`, ...renderDraftNotice(d) });
}

/**
 * Default: writes the message to .data/outbox/ (nobody is emailed).
 * Real delivery only when EMAIL_DELIVERY=on and Resend is configured.
 */
async function deliver(m: { key: string; subject: string; text: string; html: string; replyTo?: string }): Promise<{ delivered: boolean; where: string }> {
  const key = m.key.replace(/[^A-Za-z0-9-]/g, "").slice(0, 100);
  if (!config.email.deliver) {
    const dir = path.join(config.dataDir, "outbox");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${key}.html`), m.html, "utf8");
    await writeFile(path.join(dir, `${key}.txt`), `Subject: ${m.subject}\n\n${m.text}`, "utf8");
    return { delivered: false, where: `outbox/${key}.html` };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.email.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.email.from, to: config.email.to, subject: m.subject, text: m.text, html: m.html, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`Alert email failed (${res.status})`);
  return { delivered: true, where: "email" };
}
