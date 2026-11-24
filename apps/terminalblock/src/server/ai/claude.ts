import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { config } from "@/server/config";

/**
 * One place that talks to Claude. Only used when AI is enabled
 * (ANTHROPIC_API_KEY set). Callers must handle AiUnavailableError and fall back.
 */
export class AiUnavailableError extends Error {}

let client: Anthropic | null = null;
function anthropic() {
  if (!config.ai.enabled) throw new AiUnavailableError("AI is not configured");
  client ??= new Anthropic({ maxRetries: 2, timeout: 120_000 });
  return client;
}

type Effort = "low" | "medium" | "high";

/**
 * Structured call: Claude's reply is validated against `schema` and returned
 * typed. Uses the server-side refusal fallback so a policy decline on the
 * primary model is retried automatically on a fallback model.
 */
export async function structured<S extends z.ZodType>(
  schema: S,
  opts: {
    system: string;
    content: Anthropic.Beta.BetaContentBlockParam[] | string;
    effort?: Effort;
    maxTokens?: number;
  },
): Promise<z.infer<S>> {
  let res;
  try {
    res = await anthropic().beta.messages.parse({
      model: config.ai.model,
      max_tokens: opts.maxTokens ?? 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: opts.system,
      messages: [{ role: "user", content: opts.content }],
      output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(schema) },
    });
  } catch (error) {
    if (error instanceof AiUnavailableError) throw error;
    if (error instanceof Anthropic.AuthenticationError) throw new AiUnavailableError("The Anthropic API key was rejected");
    if (error instanceof Anthropic.RateLimitError) throw new AiUnavailableError("AI is rate-limited, try again shortly");
    if (error instanceof Anthropic.APIError) throw new AiUnavailableError(`AI request failed (${error.status ?? "network"})`);
    throw error;
  }
  if (res.stop_reason === "refusal") throw new AiUnavailableError("The model declined this request");
  if (res.stop_reason === "max_tokens") throw new AiUnavailableError("The AI response was cut off");
  if (res.parsed_output == null) throw new AiUnavailableError("The AI response did not match the expected format");
  return res.parsed_output as z.infer<S>;
}
