import type { Email } from "@/services/gmail/gmail.types";

export function toAssistantOpenEmail(email: Email) {
  return {
    id: email.id,
    fromName: email.from.name || email.from.email,
    fromEmail: email.from.email,
    to: email.to,
    subject: email.subject || "(no subject)",
    snippet: email.snippet || "",
    body: email.body,
    htmlBody: email.htmlBody,
    date: new Date(email.date).toISOString(),
    unread: email.unread,
    starred: email.starred,
  };
}
