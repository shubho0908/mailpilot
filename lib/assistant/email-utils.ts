import type { Email } from "@/services/gmail/gmail.types";
import { composeModeSchema } from "@/lib/mail/types";
import type { AssistantComposeDraft } from "@/lib/assistant/actions";

function safeIsoDate(date: Email["date"]) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function safeLocaleDate(date: Email["date"]) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function previewEmail(email: Email) {
  return {
    id: email.id,
    fromName: email.from.name || email.from.email,
    fromEmail: email.from.email,
    subject: email.subject || "(no subject)",
    snippet: email.snippet || "",
    date: safeIsoDate(email.date),
    unread: email.unread,
  };
}

export function textFromEmail(email: Email) {
  return email.body || (email.htmlBody ? htmlToText(email.htmlBody) : "");
}

export function buildForwardBody(emails: Email[], intro?: string | null) {
  const forwardedSections = emails.map((email, index) => {
    return [
      `--- Forwarded Message ${emails.length > 1 ? index + 1 : ""} ---`.trim(),
      `From: ${email.from.name || email.from.email}`,
      `Date: ${safeLocaleDate(email.date)}`,
      `To: ${email.to.map((recipient) => recipient.email).join(", ")}`,
      `Subject: ${email.subject || "(no subject)"}`,
      "",
      textFromEmail(email),
    ].join("\n");
  });

  return [intro?.trim() || "", ...forwardedSections].filter(Boolean).join("\n\n");
}

export function buildForwardSubject(emails: Email[], subject?: string | null) {
  if (subject?.trim()) return subject.trim();

  if (emails.length === 1) {
    const emailSubject = emails[0].subject || "(no subject)";
    return emailSubject.startsWith("Fwd:") ? emailSubject : `Fwd: ${emailSubject}`;
  }

  return `Forwarded emails (${emails.length})`;
}

export function buildReplyDraft(
  email: Email,
  body?: string | null,
  cc?: string | null,
  bcc?: string | null
): AssistantComposeDraft {
  const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
  const references = Array.from(
    new Set([...((email.references || []) as string[]), email.messageId])
  ).filter((reference): reference is string => Boolean(reference));
  const original = [
    "",
    "",
    "--- Original Message ---",
    `From: ${email.from.name || email.from.email}`,
    `Date: ${safeLocaleDate(email.date)}`,
    `To: ${email.to.map((recipient) => recipient.email).join(", ")}`,
    `Subject: ${email.subject}`,
    "",
    textFromEmail(email),
  ].join("\n");

  return {
    to: email.from.email,
    cc: cc || undefined,
    bcc: bcc || undefined,
    subject,
    body: `${body?.trim() ? `${body.trim()}\n` : ""}${original}`,
    mode: composeModeSchema.enum.reply,
    threadId: email.threadId,
    inReplyTo: email.messageId,
    references: references.length ? references : undefined,
  };
}
