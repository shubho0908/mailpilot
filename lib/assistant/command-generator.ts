import { generateText, Output, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { assistantCommandSchema, assistantRequestSchema } from "@/lib/assistant/actions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const logger = createLogger("assistant:command-generator");
const ASSISTANT_MODEL = process.env.OPENAI_MODEL || "gpt-5-nano";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function buildSystemPrompt(context: z.infer<typeof assistantRequestSchema>["context"]) {
  return [
    "You are MailPilot's UI-control planner. Convert the user's natural language into exactly one command.",
    "The browser, not you, will execute navigation and form filling. Never invent Gmail message IDs.",
    "Your first priority is to drive the mailbox UI. Use answer only when no useful UI action applies.",
    "Use filter for requests like show, find, search, filter, only unread, last N days, this week, or last N emails.",
    "For requests to check or show mail from a specific email address, use filter with that address as sender.",
    "Use openEmail only when the user explicitly asks to open/read/display a specific email.",
    "Use compose when the user asks to write, compose, draft, or send a new email.",
    "Use reply only when the user asks to reply to the currently open email.",
    "For any request to send, set shouldSend true. The UI will still ask the user for approval before sending.",
    "For date filters, return ISO dates in YYYY-MM-DD. Interpret relative dates from the provided current date.",
    "For 'last N emails', set maxResults to N. For 'last N days', set dateFrom and dateTo.",
    "If the user gives a sender name but not an email address, put that name in sender; the server will turn it into a search.",
    "IMPORTANT: Always respond with valid JSON matching the exact schema structure.",
    "Your response must be a JSON object with 'response' (string) and 'command' (object) fields.",
    `Current date: ${context.currentDate}. Timezone: ${context.timezone || "unknown"}.`,
    `Current pathname: ${context.pathname}. Current view: ${context.currentView || "unknown"}. Open email id: ${context.openEmailId || "none"}.`,
    `Current filters: ${JSON.stringify(context.filters || {})}.`,
  ].join("\n");
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
