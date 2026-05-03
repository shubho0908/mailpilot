import { z } from "zod";
import type { Email } from "@/services/gmail/gmail.types";
import { mailViewSchema } from "@/lib/mail/types";
import {
  assistantRequestSchema,
  type AssistantEmailListContext,
  type AssistantFilters,
  type AssistantPlanStep,
} from "@/lib/assistant/actions";
import { previewEmail } from "./email-utils";

export type AssistantContext = z.infer<typeof assistantRequestSchema>["context"];
export type RequestedPosition = number | "last";

export function isEmailAddress(value: string | null | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export function hasValidRecipients(value: string) {
  const recipients = value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  return recipients.length > 0 && recipients.every(isEmailAddress);
}

export function normalizeFilters(command: AssistantPlanStep): AssistantFilters {
  const normalized: AssistantFilters = {
    search: command.search ?? "",
    sender: null,
    dateFrom: command.dateFrom ?? null,
    dateTo: command.dateTo ?? null,
    unread: command.unread ?? null,
    maxResults: command.maxResults ?? null,
  };

  if (command.sender && isEmailAddress(command.sender)) {
    normalized.sender = command.sender;
  } else if (command.sender) {
    normalized.search = [normalized.search, command.sender].filter(Boolean).join(" ");
  }

  return normalized;
}

export function indexFromPosition(position: RequestedPosition, length: number) {
  if (length === 0) return -1;
  return position === "last" ? length - 1 : position - 1;
}

export function hasOpenSearchCriteria(command: AssistantPlanStep) {
  return Boolean(
    command.search ||
    command.sender ||
    command.keyword ||
    command.subject ||
    command.dateFrom ||
    command.dateTo ||
    command.unread !== undefined
  );
}

export function listMatchesCommand(list: AssistantEmailListContext, command: AssistantPlanStep) {
  return !command.view || list.view === command.view;
}

export function matchesSearchTerm(value: string, term: string) {
  return value.toLowerCase().includes(term.trim().toLowerCase());
}

export function listItemMatchesCommand(
  item: AssistantEmailListContext["emails"][number],
  command: AssistantPlanStep
) {
  const recipientText = item.to
    ?.map((recipient) => `${recipient.name} ${recipient.email}`)
    .join(" ");
  const participantText = [item.fromName, item.fromEmail, recipientText].filter(Boolean).join(" ");
  const searchableText = [participantText, item.subject, item.snippet].join(" ");
  const terms = [command.search, command.keyword, command.subject].filter((term): term is string =>
    Boolean(term?.trim())
  );

  if (command.sender?.trim()) {
    const sender = command.sender.trim();
    if (!matchesSearchTerm(participantText, sender)) {
      return false;
    }
  }

  if (command.unread !== undefined && item.unread !== command.unread) {
    return false;
  }

  return terms.every((term) => matchesSearchTerm(searchableText, term));
}

export function previewFromListItem(item: AssistantEmailListContext["emails"][number]) {
  return {
    id: item.id,
    fromName: item.fromName,
    fromEmail: item.fromEmail,
    subject: item.subject,
    snippet: item.snippet,
    date: item.date,
    unread: item.unread,
  };
}

export function findContextListEmail(
  command: AssistantPlanStep,
  context: z.infer<typeof assistantRequestSchema>["context"],
  previousEmails: Email[],
  requestedPosition: (
    command: AssistantPlanStep,
    context: z.infer<typeof assistantRequestSchema>["context"]
  ) => RequestedPosition | undefined
) {
  const position = requestedPosition(command, context);

  if (!position && !command.usePreviousResults) {
    return undefined;
  }

  if (position && command.usePreviousResults && previousEmails.length > 0) {
    const email = previousEmails[indexFromPosition(position, previousEmails.length)];
    if (email) {
      return {
        id: email.id,
        view: command.view ?? context.currentView ?? mailViewSchema.enum.inbox,
        preview: previewEmail(email),
      };
    }
  }

  const lists = command.usePreviousResults
    ? [context.lastAssistantResults, context.currentList]
    : [context.currentList, context.lastAssistantResults];

  for (const list of lists) {
    if (!list || !listMatchesCommand(list, command)) continue;

    const candidates = hasOpenSearchCriteria(command)
      ? list.emails.filter((item: AssistantEmailListContext["emails"][number]) =>
          listItemMatchesCommand(item, command)
        )
      : list.emails;
    const index = position ? indexFromPosition(position, candidates.length) : 0;
    if (index < 0) continue;

    const item = candidates[index];
    if (!item) continue;

    return {
      id: item.id,
      view: list.view,
      preview: previewFromListItem(item),
    };
  }

  return undefined;
}
