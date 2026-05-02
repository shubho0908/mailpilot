import type { Email } from "@/services/gmail/gmail.types";

export function plainTextFromEmail(email: Email) {
  return email.body || email.htmlBody?.replace(/<[^>]*>/g, "") || "";
}

export function replyHeadersForEmail(email: Email) {
  const references = Array.from(
    new Set([...((email.references || []) as string[]), email.messageId])
  ).filter((reference): reference is string => Boolean(reference));

  return {
    inReplyTo: email.messageId,
    references: references.length ? references : undefined,
  };
}
