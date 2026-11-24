import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const lineSchema = z.object({
  part: text(120).min(1),
  manufacturer: text(80).default(""),
  qty: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? null : Number(v.replace(/[^\d]/g, ""))))
    .pipe(z.number().int().min(1).max(10_000_000).nullable())
    .default(null),
  notes: text(500).default(""),
});

export const submissionSchema = z
  .object({
    lines: z.array(lineSchema).max(500).default([]),
    details: z
      .object({
        urgency: text(60).default(""),
        equivalents: text(60).default(""),
        province: text(60).default(""),
        notes: text(4000).default(""),
      })
      .default({ urgency: "", equivalents: "", province: "", notes: "" }),
    contact: z.object({
      name: text(120).min(2, "Your name is required."),
      company: text(160).min(2, "Company is required."),
      email: z.string().trim().toLowerCase().email("A valid email is required.").max(200),
      phone: text(40).default(""),
      marketingOptIn: z.boolean().default(false),
      consent: z.literal(true, { error: "Please confirm we can contact you about this request." }),
    }),
    // anti-spam
    website: z.string().max(200).default(""), // honeypot: real users never fill this
    startedAt: z.number().int().nonnegative().default(0),
  })
  .strict();

export type Submission = z.infer<typeof submissionSchema>;
