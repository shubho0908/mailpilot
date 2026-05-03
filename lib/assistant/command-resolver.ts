import { z } from "zod";
import type { Email, GmailAuth } from "@/services/gmail/gmail.types";
import {
  assistantResponseSchema,
  assistantPlanSchema,
  type AssistantPlanStep,
  type AssistantResponse,
  type AssistantUiAction,
  AssistantCommandType,
} from "@/lib/assistant/actions";
import {
  handleFilterCommand,
  handleOpenEmailCommand,
  handleComposeCommand,
  handleReplyCommand,
  handleForwardEmailsCommand,
  handleNavigateCommand,
  handleClearFiltersCommand,
  handleDeleteCommand,
  type CommandHandlerContext,
  type CommandHandlerResult,
} from "./command-handlers";
import { type AssistantContext, type RequestedPosition } from "./command-utils";

const ORDINAL_WORDS = new Map<string, number>([
  ["first", 1],
  ["one", 1],
  ["latest", 1],
  ["newest", 1],
  ["top", 1],
  ["second", 2],
  ["two", 2],
  ["third", 3],
  ["three", 3],
  ["fourth", 4],
  ["four", 4],
  ["fifth", 5],
  ["five", 5],
  ["sixth", 6],
  ["six", 6],
  ["seventh", 7],
  ["seven", 7],
  ["eighth", 8],
  ["eight", 8],
  ["ninth", 9],
  ["nine", 9],
  ["tenth", 10],
  ["ten", 10],
]);

function parseRequestedPosition(message?: string | null): RequestedPosition | undefined {
  if (!message) return undefined;

  const text = message.toLowerCase();
  if (
    /\b(oldest|bottom)\b/.test(text) ||
    /\blast\s+(?:one|email|message|item|result)\b/.test(text)
  ) {
    return "last";
  }

  for (const [word, position] of ORDINAL_WORDS) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return position;
  }

  const numericMatch =
    text.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/) ||
    text.match(/\b(?:open|select|choose|show|view|go to)\s+(?:the\s+)?(\d{1,2})\b/) ||
    text.match(/\b(?:result|email|message|item|number|#)\s*(\d{1,2})\b/) ||
    text.match(/\b(\d{1,2})\s+(?:one|email|message|item|result)\b/);
  if (!numericMatch) return undefined;

  const position = Number.parseInt(numericMatch[1], 10);
  return position > 0 ? position : undefined;
}

function requestedPosition(command: AssistantPlanStep, context: AssistantContext) {
  return command.resultIndex ?? parseRequestedPosition(context.latestUserMessage);
}

async function resolveCommand(
  commandResult: z.infer<typeof assistantPlanSchema>,
  context: AssistantContext,
  auth: GmailAuth
): Promise<AssistantResponse> {
  const actions: AssistantUiAction[] = [];
  const previews: NonNullable<AssistantResponse["previews"]> = [];
  const previewIds = new Set<string>();
  let previousEmails: Email[] = [];
  const mutableContext = { ...context };

  const ctx: CommandHandlerContext = {
    actions,
    previews,
    previewIds,
    addPreview: (preview) => {
      if (previewIds.has(preview.id)) return;
      previewIds.add(preview.id);
      previews.push(preview);
    },
    previousEmails,
    mutableContext,
    auth,
  };

  for (const command of commandResult.steps) {
    ctx.previousEmails = previousEmails;

    let result: CommandHandlerResult;

    switch (command.type) {
      case AssistantCommandType.Filter:
        result = await handleFilterCommand(command, ctx);
        break;
      case AssistantCommandType.OpenEmail:
        result = await handleOpenEmailCommand(command, ctx, requestedPosition);
        break;
      case AssistantCommandType.Compose:
        result = handleComposeCommand(command, ctx);
        break;
      case AssistantCommandType.Reply:
        result = await handleReplyCommand(command, ctx);
        break;
      case AssistantCommandType.ForwardEmails:
        result = await handleForwardEmailsCommand(command, ctx, requestedPosition);
        break;
      case AssistantCommandType.Navigate:
        result = handleNavigateCommand(command, ctx);
        break;
      case AssistantCommandType.ClearFilters:
        result = handleClearFiltersCommand(command, ctx);
        break;
      case AssistantCommandType.Answer:
        continue;
      case AssistantCommandType.Delete:
        result = handleDeleteCommand(command, ctx);
        break;
      default:
        const _exhaustiveCheck: never = command.type;
        throw new Error(`Unknown command type: ${_exhaustiveCheck}`);
    }

    if (result.earlyResponse) {
      return result.earlyResponse;
    }

    if (!result.shouldContinue) {
      break;
    }

    if (result.previousEmails) {
      previousEmails = result.previousEmails;
    }
  }

  return assistantResponseSchema.parse({
    message: commandResult.response,
    actions,
    previews,
  });
}

export { resolveCommand };
