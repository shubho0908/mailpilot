import { generateText, Output, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { requireEnv } from "@/lib/env";
import {
  assistantPlanSchema,
  assistantRequestSchema,
  assistantStructuredPlanSchema,
  normalizeStructuredAssistantPlan,
} from "@/lib/assistant/actions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const logger = createLogger("assistant:command-generator");
const ASSISTANT_MODEL = requireEnv("OPENAI_MODEL");

function formatRecipients(to?: { name: string; email: string }[]) {
  if (!to?.length) return "";
  return to.map((recipient) => recipient.email).join(", ");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function formatListContext(
  title: string,
  list: z.infer<typeof assistantRequestSchema>["context"]["currentList"]
) {
  if (!list || list.emails.length === 0) return "";

  const emailLines = list.emails
    .slice(0, 10)
    .map((email) =>
      [
        `${email.position}.`,
        `id=${email.id}`,
        `from=${email.fromName} <${email.fromEmail}>`,
        formatRecipients(email.to) ? `to=${formatRecipients(email.to)}` : "",
        `subject=${email.subject}`,
        `date=${email.date}`,
        `unread=${email.unread}`,
      ]
        .filter(Boolean)
        .join(" ")
    );

  return [
    `${title}:`,
    `Source=${list.source} URL=${list.pathname} View=${list.view} Filters=${JSON.stringify(list.filters)} ResultEstimate=${list.resultSizeEstimate ?? "unknown"} NextPage=${list.nextPageAvailable ?? false}`,
    ...emailLines,
  ].join("\n");
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

  const composeFormContext = context.currentComposeFormState
    ? [
        `Current compose form:`,
        `To: ${context.currentComposeFormState.to}`,
        `Cc: ${context.currentComposeFormState.cc}`,
        `Bcc: ${context.currentComposeFormState.bcc}`,
        `Subject: ${context.currentComposeFormState.subject}`,
        `Body: ${context.currentComposeFormState.body ? "(has content)" : "(empty)"}`,
      ].join("\n")
    : "";

  const prompt = [
    "Role: MailPilot email assistant. Convert user input to a short executable email plan.",
    "",
    "Scope: Help ONLY with email tasks in this application. For non-email requests (relationships, personal problems, general coding, homework, entertainment), respond: 'I can only help you with email-related tasks in this MailPilot application.'",
    "",
    "Identity: If asked for your name, respond: 'MailPilot'.",
    "",
    "Commands (ONLY use these exact values for the 'type' field):",
    "- filter: Search emails (unread, dates, sender)",
    "- openEmail: Open specific email",
    "- compose: Write/draft/send new email",
    "- reply: Respond to open email",
    "- forwardEmails: Forward one or more found emails as a new draft",
    "- delete: Delete open email",
    "- answer: Explain/summarize open email (no UI actions)",
    "- navigate: Change view",
    "- clearFilters: Reset filters",
    "",
    "CRITICAL: NEVER invent or use any action types other than the 9 listed above. The 'type' field must be exactly one of: filter, openEmail, compose, reply, forwardEmails, delete, answer, navigate, or clearFilters.",
    "",
    "Rules:",
    "- Return a complete ordered plan that executes ALL steps requested by the user in sequence.",
    "- When the user gives multiple instructions (e.g., 'filter emails, then open the latest, then reply'), ALWAYS generate ALL steps in the plan, even if later steps depend on earlier ones.",
    "- For multi-step requests: first step filters/opens, subsequent steps operate on results from previous steps.",
    "- Every step must include every command field required by the schema. Use null for fields that are not relevant to the command type.",
    "- Infer recipients, message content, filters, views, counts, and dates from the user's wording.",
    "- Use usePreviousResults=true when a step should operate on emails found by a previous step.",
    "- For ordinal requests like 'open the third one', set resultIndex to the 1-based position from Current visible email list. If the user refers to your previous previewed results, use Last assistant result list.",
    "- Use shouldSend=true ONLY when the user explicitly uses words like 'send', 'send it', 'send the email', 'send the reply', etc. If the user says 'compose a reply' or 'draft a reply', do NOT set shouldSend=true.",
    "- Use real Gmail IDs only from provided context.",
    "- Dates must be ISO format (YYYY-MM-DD).",
    "- CRITICAL HIGHEST PRIORITY: When Current compose form exists with partial data (to, subject, body), ALWAYS use the existing values and GENERATE the missing fields. When user asks to 'write', 'complete', 'fill', 'help with', or similar for an email, NEVER return an answer step asking for the body. Always generate a compose command with ALL fields filled.",
    "- When generating the body for a compose command, infer reasonable content from the subject line and recipient. For example, if subject is 'Meeting Tomorrow', generate a body like 'Hi [name], let's meet tomorrow to discuss...'",
    "- Only return an answer step asking for missing information if there is NO current compose form at all.",
    "- If replying or forwarding from an open email, use the open email context.",
    "- The response field must always be a string explaining what action will be taken or what information is needed.",
    "",
    `Context: Date=${context.currentDate} TZ=${context.timezone || "unknown"} URL=${context.currentUrl || context.pathname} Path=${context.pathname} View=${context.currentView || "unknown"} OpenEmail=${context.openEmailId || "none"} Filters=${JSON.stringify(context.filters || {})}`,
    openEmailContext,
    composeFormContext,
    formatListContext("Current visible email list", context.currentList),
    formatListContext("Last assistant result list", context.lastAssistantResults),
  ]
    .filter(Boolean)
    .join("\n");

  return prompt;
}

async function generateCommandWithRetry(
  messages: ModelMessage[],
  systemPrompt: string,
  userId: string,
  userOpenAIKey: string
): Promise<z.infer<typeof assistantPlanSchema>> {
  let lastError: Error | null = null;
  const openai = createOpenAI({ apiKey: userOpenAIKey });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateText({
        model: openai(ASSISTANT_MODEL),
        output: Output.object({
          schema: assistantStructuredPlanSchema,
        }),
        system: systemPrompt,
        messages,
      });

      const normalizedOutput = normalizeStructuredAssistantPlan(result.output);

      return normalizedOutput;
    } catch (error) {
      const structuredError = toError(error);
      lastError = structuredError;

      logger.error(`Structured output generation failed (attempt ${attempt}/${MAX_RETRIES})`);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  logger.error("All structured output attempts failed");
  throw lastError || new Error("Structured output generation failed");
}

export { buildSystemPrompt, generateCommandWithRetry };
