import { useMailStore } from "@/lib/store/mail-store";
import type { AssistantComposeDraft } from "@/lib/assistant/actions";
import { mailViewSchema, pathForMailRoute, type MailView } from "@/lib/mail/types";

export function getCurrentView(pathname: string): MailView | undefined {
  if (pathname.startsWith(pathForMailRoute(mailViewSchema.enum.sent))) {
    return mailViewSchema.enum.sent;
  }
  if (pathname.startsWith(pathForMailRoute(mailViewSchema.enum.inbox))) {
    return mailViewSchema.enum.inbox;
  }
  return undefined;
}

export function getOpenEmailId(pathname: string) {
  const [, route, id] = pathname.split("/");
  return mailViewSchema.safeParse(route).success ? id || null : null;
}

export function draftToComposeState(draft: AssistantComposeDraft) {
  return {
    initialTo: draft.to,
    initialCc: draft.cc,
    initialBcc: draft.bcc,
    initialSubject: draft.subject,
    initialBody: draft.body,
    mode: draft.mode,
    threadId: draft.threadId,
    inReplyTo: draft.inReplyTo,
    references: draft.references,
  };
}

export function getLatestDraft(fallback: AssistantComposeDraft): AssistantComposeDraft {
  const composeState = useMailStore.getState().composeState;

  return {
    ...fallback,
    to: composeState?.initialTo || fallback.to,
    cc: composeState?.initialCc || fallback.cc,
    bcc: composeState?.initialBcc || fallback.bcc,
    subject: composeState?.initialSubject || fallback.subject,
    body: composeState?.initialBody || fallback.body,
    mode: composeState?.mode || fallback.mode,
    threadId: composeState?.threadId || fallback.threadId,
    inReplyTo: composeState?.inReplyTo || fallback.inReplyTo,
    references: composeState?.references || fallback.references,
  };
}

export function formatPreviewDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString([], { month: "short", day: "numeric" });
}
