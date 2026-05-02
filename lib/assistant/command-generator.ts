import { generateText, Output, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { requireEnv } from "@/lib/env";
import { assistantCommandSchema, assistantRequestSchema } from "@/lib/assistant/actions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const EMAIL_BODY_FULL_LENGTH = 10000;

const logger = createLogger("assistant:command-generator");
const ASSISTANT_MODEL = requireEnv("OPENAI_MODEL");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function buildSystemPrompt(context: z.infer<typeof assistantRequestSchema>["context"]) {
  let openEmailContext = "";
  if (context.openEmail) {
    const email = context.openEmail;
    const toEmails = email.to.map((t) => t.email).join(", ");
    const bodyPreview = email.body
      ? email.body.substring(0, EMAIL_BODY_FULL_LENGTH) +
        (email.body.length > EMAIL_BODY_FULL_LENGTH ? "..." : "")
      : "";

    openEmailContext = [
      `Open email details:`,
      `- Subject: ${email.subject}`,
      `- From: ${email.fromName} <${email.fromEmail}>`,
      `- To: ${toEmails}`,
      `- Date: ${email.date}`,
      `- Unread: ${email.unread}`,
      `- Starred: ${email.starred}`,
      `- Snippet: ${email.snippet}`,
      bodyPreview ? `- Body: ${bodyPreview}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Role: UI-control planner. Convert user input to exactly one command.",
    "Browser executes navigation. Never invent Gmail message IDs.",
    "Priority: drive mailbox UI. Use 'answer' only when no UI action applies.",
    "Commands:",
    "- filter: show/find/search emails (unread, date ranges, sender)",
    "- openEmail: explicitly open/read specific email",
    "- compose: write/draft/send new email",
    "- reply: respond to currently open email",
    "- delete: delete currently open email",
    "- answer: explain/summarize currently open email (no UI actions, no IDs)",
    "- navigate: change view",
    "- clearFilters: reset filters",
    "Send requests: set shouldSend=true. UI requires approval.",
    "Dates: ISO format (YYYY-MM-DD). For a named day like today/yesterday, set dateFrom and dateTo to that day; the app treats dateTo as inclusive. For 'from today onward', set dateFrom only. 'last N emails' = maxResults=N. 'last N days' = dateFrom/dateTo.",
    "Sender: non-email → search term, email → filter by sender.",
    "Recipients: Multiple email addresses supported. Use comma-separated format (e.g., 'email1@example.com, email2@example.com'). Parse natural language to determine which recipients go in 'to', 'cc', or 'bcc' based on user phrasing (e.g., 'in cc', 'carbon copy', 'bcc', blind copy). Use contextual understanding - primary recipients in 'to', secondary/informational in 'cc', hidden in 'bcc'.",
    "Response format: JSON with 'response' (string) and 'command' (object).",
    `Date: ${context.currentDate}. TZ: ${context.timezone || "unknown"}.`,
    `Path: ${context.pathname}. View: ${context.currentView || "unknown"}. Open email: ${context.openEmailId || "none"}.`,
    `Filters: ${JSON.stringify(context.filters || {})}.`,
    openEmailContext,
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateCommandWithRetry(
  messages: ModelMessage[],
  systemPrompt: string,
  userId: string
): Promise<z.infer<typeof assistantCommandSchema>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateText({
        model: openai(ASSISTANT_MODEL),
        output: Output.object({
          schema: assistantCommandSchema,
        }),
        providerOptions: {
          openai: {
            strictJsonSchema: true,
          },
        },
        system: systemPrompt,
        messages,
      });

      return result.output;
    } catch (error) {
      const structuredError = toError(error);
      lastError = structuredError;
      logger.error(`Structured generation failed (attempt ${attempt}/${MAX_RETRIES})`, {
        userId,
        error: structuredError.message,
        errorName: structuredError.name,
      });

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  try {
    const textResult = await generateText({
      model: openai(ASSISTANT_MODEL),
      system: `${systemPrompt}\n\nIMPORTANT: Your response must be valid JSON only, no markdown, no additional text.`,
      messages,
    });

    let jsonStr = textResult.text.trim();

    if (jsonStr.startsWith("```")) {
      const lines = jsonStr.split("\n");
      const jsonStart = lines.findIndex(
        (line) => line.trim() === "```json" || line.trim() === "```"
      );
      const jsonEnd = lines.findIndex((line, idx) => idx > jsonStart && line.trim() === "```");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = lines
          .slice(jsonStart + 1, jsonEnd)
          .join("\n")
          .trim();
      } else if (jsonStart >= 0) {
        jsonStr = lines
          .slice(jsonStart + 1)
          .join("\n")
          .trim();
      }
    }

    const parsed = JSON.parse(jsonStr);
    const validated = assistantCommandSchema.parse(parsed);

    return validated;
  } catch (fallbackError) {
    const parsedFallbackError = toError(fallbackError);
    logger.error("Fallback text generation also failed", {
      userId,
      error: parsedFallbackError.message,
      errorName: parsedFallbackError.name,
    });
    throw lastError || parsedFallbackError;
  }
}

export { buildSystemPrompt, generateCommandWithRetry };
