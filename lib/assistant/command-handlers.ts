import { z } from "zod";
import { getEmail, listEmailsPage } from "@/services/gmail/gmail.service";
import type { Email, GmailAuth } from "@/services/gmail/gmail.types";
import {
  composeModeSchema,
  isInboxView,
  isSentView,
  mailLabelByView,
  mailViewSchema,
  pathForMailRoute,
} from "@/lib/mail/types";
import {
  assistantResponseSchema,
  assistantRequestSchema,
  type AssistantPlanStep,
  type AssistantResponse,
  type AssistantEmailPreview,
  type AssistantUiAction,
} from "@/lib/assistant/actions";
import { normalizeInclusiveDateRange } from "@/lib/mail/date-range";
import {
  previewEmail,
  buildReplyDraft,
  buildForwardSubject,
  buildForwardBody,
} from "./email-utils";
import {
  type RequestedPosition,
  isEmailAddress,
  hasValidRecipients,
  normalizeFilters,
  hasOpenSearchCriteria,
  findContextListEmail,
  indexFromPosition,
} from "./command-utils";

interface CommandHandlerContext {
  actions: AssistantUiAction[];
  previews: NonNullable<AssistantResponse["previews"]>;
  previewIds: Set<string>;
  addPreview: (preview: AssistantEmailPreview) => void;
  previousEmails: Email[];
  mutableContext: z.infer<typeof assistantRequestSchema>["context"];
  auth: GmailAuth;
}

interface CommandHandlerResult {
  previousEmails?: Email[];
  shouldContinue: boolean;
  earlyResponse?: AssistantResponse;
}

export async function handleFilterCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): Promise<CommandHandlerResult> {
  const view = command.view ?? mailViewSchema.enum.inbox;
  const filters = normalizeFilters(command);
  const dateRange = normalizeInclusiveDateRange({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });
  ctx.actions.push({ type: "setFilters", view, filters });

  const result = await listEmailsPage(ctx.auth, {
    filters: {
      label: mailLabelByView[view],
      query: filters.search ?? undefined,
      from: isInboxView(view) ? (filters.sender ?? undefined) : undefined,
      to: isSentView(view) ? (filters.sender ?? undefined) : undefined,
      after: dateRange.after,
      before: dateRange.before,
      unread: filters.unread ?? undefined,
    },
    maxResults: filters.maxResults ?? 5,
  });

  for (const email of result.emails.slice(0, 5)) {
    ctx.addPreview(previewEmail(email));
  }

  ctx.mutableContext.filters = filters;
  ctx.mutableContext.currentView = view;

  return {
    previousEmails: result.emails,
    shouldContinue: true,
  };
}

export async function handleOpenEmailCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext,
  requestedPosition: (
    command: AssistantPlanStep,
    context: z.infer<typeof assistantRequestSchema>["context"]
  ) => RequestedPosition | undefined
): Promise<CommandHandlerResult> {
  const contextualEmail = findContextListEmail(
    command,
    ctx.mutableContext,
    ctx.previousEmails,
    requestedPosition
  );

  if (contextualEmail) {
    ctx.actions.push({
      type: "openEmail",
      view: contextualEmail.view,
      emailId: contextualEmail.id,
    });
    ctx.addPreview(contextualEmail.preview);
    ctx.mutableContext.openEmailId = contextualEmail.id;
    return { shouldContinue: true };
  }

  const position = requestedPosition(command, ctx.mutableContext);
  const fallbackFilters =
    !hasOpenSearchCriteria(command) && ctx.mutableContext.currentList
      ? ctx.mutableContext.currentList.filters
      : normalizeFilters(command);
  const view =
    command.view ??
    ctx.mutableContext.currentList?.view ??
    ctx.mutableContext.currentView ??
    mailViewSchema.enum.inbox;
  const senderIsEmail = isEmailAddress(command.sender);
  const query = [fallbackFilters.search, command.keyword, command.subject]
    .filter(Boolean)
    .join(" ");
  const dateRange = normalizeInclusiveDateRange({
    dateFrom: command.dateFrom ?? fallbackFilters.dateFrom,
    dateTo: command.dateTo ?? fallbackFilters.dateTo,
  });
  const maxResults =
    typeof position === "number" ? Math.max(position, 5) : (command.maxResults ?? 5);

  const result = await listEmailsPage(ctx.auth, {
    filters: {
      label: mailLabelByView[view],
      from: isInboxView(view)
        ? senderIsEmail
          ? (command.sender ?? undefined)
          : (fallbackFilters.sender ?? undefined)
        : undefined,
      to: isSentView(view)
        ? senderIsEmail
          ? (command.sender ?? undefined)
          : (fallbackFilters.sender ?? undefined)
        : undefined,
      query: query || undefined,
      after: dateRange.after,
      before: dateRange.before,
      unread: command.unread ?? fallbackFilters.unread ?? undefined,
    },
    maxResults,
  });

  const fallbackIndex = position ? indexFromPosition(position, result.emails.length) : 0;
  const email = result.emails[fallbackIndex] ?? result.emails[0];
  if (!email) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "I could not find a matching email in your mailbox.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  ctx.actions.push({
    type: "openEmail",
    view,
    emailId: email.id,
  });
  ctx.addPreview(previewEmail(email));
  ctx.mutableContext.openEmailId = email.id;

  return {
    previousEmails: [email],
    shouldContinue: true,
  };
}

export function handleComposeCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): CommandHandlerResult {
  const currentForm = ctx.mutableContext.currentComposeFormState;
  const to = command.to || currentForm?.to || "";
  const subject = command.subject || currentForm?.subject || "";
  const body = command.body || currentForm?.body || "";
  const cc = command.cc || currentForm?.cc || "";
  const bcc = command.bcc || currentForm?.bcc || "";

  if (!to || !subject || !body) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "I need a recipient, subject, and body before I can prepare that draft.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }
  if (!hasValidRecipients(to)) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "I need a valid recipient email address before I can prepare that draft.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  const shouldSend = command.shouldSend ?? false;
  ctx.actions.push({ type: "navigate", path: pathForMailRoute("compose") });
  ctx.actions.push({
    type: "composeDraft",
    draft: {
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      body,
      mode: composeModeSchema.enum.compose,
    },
    requiresApproval: shouldSend,
    approvalPrompt: shouldSend ? `Send this email to ${to}?` : undefined,
  });
  ctx.mutableContext.openEmailId = null;

  return { shouldContinue: true };
}

export async function handleReplyCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): Promise<CommandHandlerResult> {
  if (!ctx.mutableContext.openEmailId) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "Open an email first, then I can prepare a reply in the compose view.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  const email = await getEmail(ctx.auth, ctx.mutableContext.openEmailId);
  const draft = buildReplyDraft(email, command.body, command.cc, command.bcc);
  const shouldSend = command.shouldSend ?? false;
  ctx.actions.push({ type: "navigate", path: pathForMailRoute("compose") });
  ctx.actions.push({
    type: "composeDraft",
    draft,
    requiresApproval: shouldSend,
    approvalPrompt: shouldSend ? `Send this reply to ${draft.to}?` : undefined,
  });
  ctx.addPreview(previewEmail(email));
  ctx.mutableContext.openEmailId = null;

  return {
    previousEmails: [email],
    shouldContinue: true,
  };
}

export async function handleForwardEmailsCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext,
  requestedPosition: (
    command: AssistantPlanStep,
    context: z.infer<typeof assistantRequestSchema>["context"]
  ) => RequestedPosition | undefined
): Promise<CommandHandlerResult> {
  if (!command.to) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "Who should I forward the email to?",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }
  if (!hasValidRecipients(command.to)) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "I need a valid recipient email address before I can prepare that forward.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  let emails = command.usePreviousResults ? ctx.previousEmails : [];
  const contextualEmail = findContextListEmail(
    command,
    ctx.mutableContext,
    ctx.previousEmails,
    requestedPosition
  );

  if (emails.length === 0 && contextualEmail) {
    emails = [await getEmail(ctx.auth, contextualEmail.id)];
  }

  if (emails.length === 0 && ctx.mutableContext.openEmailId) {
    emails = [await getEmail(ctx.auth, ctx.mutableContext.openEmailId)];
  }

  if (emails.length === 0) {
    const view = command.view ?? mailViewSchema.enum.inbox;
    const filters = normalizeFilters(command);
    const dateRange = normalizeInclusiveDateRange({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    const result = await listEmailsPage(ctx.auth, {
      filters: {
        label: mailLabelByView[view],
        query: filters.search ?? undefined,
        from: isInboxView(view) ? (filters.sender ?? undefined) : undefined,
        to: isSentView(view) ? (filters.sender ?? undefined) : undefined,
        after: dateRange.after,
        before: dateRange.before,
        unread: filters.unread ?? undefined,
      },
      maxResults: command.maxResults ?? 1,
    });
    emails = result.emails;
  }

  const maxResults = command.maxResults ?? emails.length;
  const emailsToForward = emails.slice(0, maxResults);
  if (emailsToForward.length === 0) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "I could not find any emails to forward.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  for (const email of emailsToForward) {
    ctx.addPreview(previewEmail(email));
  }

  const shouldSend = command.shouldSend ?? false;
  ctx.actions.push({ type: "navigate", path: pathForMailRoute("compose") });
  ctx.actions.push({
    type: "composeDraft",
    draft: {
      to: command.to,
      cc: command.cc || undefined,
      bcc: command.bcc || undefined,
      subject: buildForwardSubject(emailsToForward, command.subject),
      body: buildForwardBody(emailsToForward, command.body),
      mode: composeModeSchema.enum.forward,
    },
    requiresApproval: shouldSend,
    approvalPrompt: shouldSend ? `Send this forward to ${command.to}?` : undefined,
  });
  ctx.mutableContext.openEmailId = null;

  return {
    previousEmails: emailsToForward,
    shouldContinue: true,
  };
}

export function handleNavigateCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): CommandHandlerResult {
  if (!command.route) {
    return { shouldContinue: true };
  }

  ctx.actions.push({ type: "navigate", path: pathForMailRoute(command.route) });
  if (command.route === mailViewSchema.enum.inbox || command.route === mailViewSchema.enum.sent) {
    ctx.mutableContext.currentView = command.route;
  }
  ctx.mutableContext.openEmailId = null;

  return { shouldContinue: true };
}

export function handleClearFiltersCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): CommandHandlerResult {
  const view = command.view ?? ctx.mutableContext.currentView ?? mailViewSchema.enum.inbox;
  ctx.actions.push({
    type: "clearFilters",
    view,
  });
  ctx.mutableContext.filters = {
    search: null,
    sender: null,
    dateFrom: null,
    dateTo: null,
    unread: null,
    maxResults: null,
  };

  return { shouldContinue: true };
}

export function handleDeleteCommand(
  command: AssistantPlanStep,
  ctx: CommandHandlerContext
): CommandHandlerResult {
  if (!ctx.mutableContext.openEmailId) {
    return {
      shouldContinue: false,
      earlyResponse: assistantResponseSchema.parse({
        message: "Open an email first, then I can delete it.",
        actions: ctx.actions,
        previews: ctx.previews,
      }),
    };
  }

  ctx.actions.push({
    type: "deleteEmail",
    emailId: ctx.mutableContext.openEmailId,
    requiresApproval: true,
    approvalPrompt: "Delete this email?",
  });
  ctx.mutableContext.openEmailId = null;

  return { shouldContinue: true };
}

export type { CommandHandlerContext, CommandHandlerResult };
