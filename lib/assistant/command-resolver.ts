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
  type AssistantComposeDraft,
  type AssistantFilters,
  type AssistantResponse,
  type AssistantUiAction,
  assistantCommandSchema,
  assistantRequestSchema,
} from "@/lib/assistant/actions";
import { normalizeInclusiveDateRange } from "@/lib/mail/date-range";

function isEmailAddress(value: string | null | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function previewEmail(email: Email) {
  return {
    id: email.id,
    fromName: email.from.name || email.from.email,
    fromEmail: email.from.email,
    subject: email.subject || "(no subject)",
    snippet: email.snippet || "",
    date: new Date(email.date).toISOString(),
    unread: email.unread,
  };
}

function textFromEmail(email: Email) {
  return email.body || email.htmlBody?.replace(/<[^>]*>/g, "") || "";
}

function buildReplyDraft(email: Email, body?: string | null): AssistantComposeDraft {
  const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
  const references = Array.from(
    new Set([...((email.references || []) as string[]), email.messageId])
  ).filter((reference): reference is string => Boolean(reference));
  const original = [
    "",
    "",
    "--- Original Message ---",
    `From: ${email.from.name || email.from.email}`,
    `Date: ${new Date(email.date).toLocaleString()}`,
    `To: ${email.to.map((recipient) => recipient.email).join(", ")}`,
    `Subject: ${email.subject}`,
    "",
    textFromEmail(email),
  ].join("\n");

  return {
    to: email.from.email,
    cc: undefined,
    bcc: undefined,
    subject,
    body: `${body?.trim() ? `${body.trim()}\n` : ""}${original}`,
    mode: composeModeSchema.enum.reply,
    threadId: email.threadId,
    inReplyTo: email.messageId,
    references: references.length ? references : undefined,
  };
}

function normalizeFilters(
  command: Extract<z.infer<typeof assistantCommandSchema>["command"], { type: "filter" }>
): AssistantFilters {
  const normalized: AssistantFilters = {
    search: command.search ?? "",
    sender: null,
    dateFrom: command.dateFrom ?? null,
    dateTo: command.dateTo ?? null,
    unread: command.unread ?? null,
    maxResults: command.maxResults ?? null,
  };

  if (isEmailAddress(command.sender)) {
    normalized.sender = command.sender;
  } else if (command.sender != null) {
    normalized.search = [normalized.search, command.sender].filter(Boolean).join(" ");
  }

  return normalized;
}

async function resolveCommand(
  commandResult: z.infer<typeof assistantCommandSchema>,
  context: z.infer<typeof assistantRequestSchema>["context"],
  auth: GmailAuth
): Promise<AssistantResponse> {
  const actions: AssistantUiAction[] = [];
  const previews: AssistantResponse["previews"] = [];
  const command = commandResult.command;

  if (command.type === "filter") {
    const view = command.view ?? mailViewSchema.enum.inbox;
    const filters = normalizeFilters(command);
    const dateRange = normalizeInclusiveDateRange({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    actions.push({ type: "setFilters", view, filters });

    const result = await listEmailsPage(auth, {
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

    previews.push(...result.emails.slice(0, 5).map(previewEmail));
    return assistantResponseSchema.parse({
      message: commandResult.response,
      actions,
      previews,
    });
  }

  if (command.type === "openEmail") {
    const view = command.view ?? mailViewSchema.enum.inbox;
    const senderIsEmail = isEmailAddress(command.sender);
    const query = [!senderIsEmail ? command.sender : null, command.keyword, command.subject]
      .filter(Boolean)
      .join(" ");

    const result = await listEmailsPage(auth, {
      filters: {
        label: mailLabelByView[view],
        from: isInboxView(view) && senderIsEmail ? (command.sender ?? undefined) : undefined,
        to: isSentView(view) && senderIsEmail ? (command.sender ?? undefined) : undefined,
        query: query ?? undefined,
        unread: command.unread ?? undefined,
      },
      maxResults: 5,
    });

    const email = result.emails[0];
    if (!email) {
      return assistantResponseSchema.parse({
        message: "I could not find a matching email in your mailbox.",
        actions: [],
        previews: [],
      });
    }

    actions.push({
      type: "openEmail",
      view: command.view ?? mailViewSchema.enum.inbox,
      emailId: email.id,
    });
    previews.push(previewEmail(email));

    return assistantResponseSchema.parse({
      message: commandResult.response,
      actions,
      previews,
    });
  }

  if (command.type === "compose") {
    const shouldSend = command.shouldSend ?? false;
    actions.push({ type: "navigate", path: pathForMailRoute("compose") });
    actions.push({
      type: "composeDraft",
      draft: {
        to: command.draft.to,
        subject: command.draft.subject,
        body: command.draft.body,
        mode: composeModeSchema.enum.compose,
      },
      requiresApproval: shouldSend,
      approvalPrompt: shouldSend ? `Send this email to ${command.draft.to}?` : undefined,
    });

    return assistantResponseSchema.parse({
      message: commandResult.response,
      actions,
      previews,
    });
  }

  if (command.type === "reply") {
    if (!context.openEmailId) {
      return assistantResponseSchema.parse({
        message: "Open an email first, then I can prepare a reply in the compose view.",
        actions: [],
        previews: [],
      });
    }

    const email = await getEmail(auth, context.openEmailId);
    const draft = buildReplyDraft(email, command.body);
    const shouldSend = command.shouldSend ?? false;
    actions.push({ type: "navigate", path: pathForMailRoute("compose") });
    actions.push({
      type: "composeDraft",
      draft,
      requiresApproval: shouldSend,
      approvalPrompt: shouldSend ? `Send this reply to ${draft.to}?` : undefined,
    });

    return assistantResponseSchema.parse({
      message: commandResult.response,
      actions,
      previews: [previewEmail(email)],
    });
  }

  if (command.type === "navigate") {
    actions.push({ type: "navigate", path: pathForMailRoute(command.view) });
  }

  if (command.type === "clearFilters") {
    actions.push({
      type: "clearFilters",
      view: command.view ?? context.currentView ?? mailViewSchema.enum.inbox,
    });
  }

  return assistantResponseSchema.parse({
    message: commandResult.response,
    actions,
    previews,
  });
}

export { resolveCommand };
