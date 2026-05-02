import { generateText, Output, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { requireEnv } from "@/lib/env";
import { assistantCommandSchema, assistantRequestSchema } from "@/lib/assistant/actions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const logger = createLogger("assistant:command-generator");
const ASSISTANT_MODEL = requireEnv("OPENAI_MODEL");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function buildSystemPrompt(context: z.infer<typeof assistantRequestSchema>["context"]) {
  const openEmailContext = context.openEmail
    ? [
        `Open email:`,
        `Subject: ${context.openEmail.subject}`,
        `From: ${context.openEmail.fromName} <${context.openEmail.fromEmail}>`,
        `To: ${context.openEmail.to.map((t) => t.email).join(", ")}`,
        `Date: ${context.openEmail.date}`,
        `Unread: ${context.openEmail.unread}`,
        `Starred: ${context.openEmail.starred}`,
        `Snippet: ${context.openEmail.snippet}`,
      ].join("\n")
    : "";

  const prompt = [
    "Role: MailPilot email assistant. Convert user input to one command.",
    "",
    "Scope: Help ONLY with email tasks in this application. For non-email requests (relationships, personal problems, general coding, homework, entertainment), respond: 'I can only help you with email-related tasks in this MailPilot application.'",
    "",
    "Identity: If asked for your name, respond: 'MailPilot'.",
    "",
    "Commands:",
    "filter: Search emails (unread, dates, sender)",
    "openEmail: Open specific email",
    "compose: Write/draft/send new email",
    "reply: Respond to open email",
    "delete: Delete open email",
    "answer: Explain/summarize open email (no UI actions)",
    "navigate: Change view",
    "clearFilters: Reset filters",
    "",
    "Rules:",
    "- Use real Gmail IDs only from context",
    "- Set shouldSend=true for send requests (requires approval)",
    "- Dates: ISO format (YYYY-MM-DD)",
    "- Multiple recipients: comma-separated (email1@example.com, email2@example.com)",
    "- Parse 'to/cc/bcc' from natural language",
    "",
    `Context: Date=${context.currentDate} TZ=${context.timezone || "unknown"} Path=${context.pathname} View=${context.currentView || "unknown"} OpenEmail=${context.openEmailId || "none"} Filters=${JSON.stringify(context.filters || {})}`,
    openEmailContext,
  ]
    .filter(Boolean)
    .join("\n");

  return prompt;
}

async function generateCommandWithRetry(
  messages: ModelMessage[],
  systemPrompt: string,
  userId: string,
  apiKey: string
): Promise<z.infer<typeof assistantCommandSchema>> {
  let lastError: Error | null = null;
  const openai = createOpenAI({ apiKey });

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
