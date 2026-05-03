import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  composeModeSchema,
  emptyMailFilters,
  mailRouteSchema,
  type ComposeMode,
  type MailFilters,
  type MailRoute,
} from "@/lib/mail/types";
import type { AssistantEmailListContext } from "@/lib/assistant/actions";

interface ComposeState {
  initialTo?: string;
  initialCc?: string;
  initialBcc?: string;
  initialSubject?: string;
  initialBody?: string;
  mode?: ComposeMode;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface CurrentComposeFormState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

interface MailState {
  currentView: MailRoute;
  openEmailId: string | null;
  filters: MailFilters;
  composeState: ComposeState | null;
  currentComposeFormState: CurrentComposeFormState | null;
  emailListContext: AssistantEmailListContext | null;
}

interface MailActions {
  setCurrentView: (view: MailRoute) => void;
  setOpenEmailId: (id: string | null) => void;
  setFilters: (filters: Partial<MailFilters>) => void;
  clearFilters: () => void;
  resetToInbox: () => void;
  setComposeState: (state: ComposeState | null) => void;
  setCurrentComposeFormState: (state: CurrentComposeFormState | null) => void;
  setEmailListContext: (context: AssistantEmailListContext | null) => void;
  openCompose: (state?: ComposeState) => void;
  openReply: (
    to: string,
    subject: string,
    body: string,
    threadId?: string,
    inReplyTo?: string,
    references?: string[]
  ) => void;
  openForward: (subject: string, body: string) => void;
}

type MailStore = MailState & MailActions;

function emailListContextsEqual(
  left: AssistantEmailListContext | null,
  right: AssistantEmailListContext | null
) {
  if (left === right) return true;
  if (!left || !right) return false;
  if (
    left.source !== right.source ||
    left.pathname !== right.pathname ||
    left.view !== right.view ||
    left.capturedAt !== right.capturedAt ||
    left.emails.length !== right.emails.length
  ) {
    return false;
  }

  return left.emails.every((email, index) => {
    const other = right.emails[index];
    return other?.id === email.id && other.position === email.position;
  });
}

const initialState: MailState = {
  currentView: mailRouteSchema.enum.inbox,
  openEmailId: null,
  filters: emptyMailFilters,
  composeState: null,
  currentComposeFormState: null,
  emailListContext: null,
};

export const useMailStore = create<MailStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setCurrentView: (view) =>
        set(
          {
            currentView: view,
            openEmailId: null,
            composeState: null,
            currentComposeFormState: null,
            emailListContext: null,
          },
          false,
          "setCurrentView"
        ),
      setOpenEmailId: (id) => set({ openEmailId: id }, false, "setOpenEmailId"),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } }), false, "setFilters"),
      clearFilters: () =>
        set({ filters: initialState.filters, emailListContext: null }, false, "clearFilters"),
      resetToInbox: () => set(initialState, false, "resetToInbox"),
      setComposeState: (composeState) => set({ composeState }, false, "setComposeState"),
      setCurrentComposeFormState: (currentComposeFormState) =>
        set({ currentComposeFormState }, false, "setCurrentComposeFormState"),
      setEmailListContext: (emailListContext) =>
        set(
          (state) =>
            emailListContextsEqual(state.emailListContext, emailListContext)
              ? state
              : { emailListContext },
          false,
          "setEmailListContext"
        ),
      openCompose: (composeState) =>
        set(
          { currentView: mailRouteSchema.enum.compose, composeState: composeState || null },
          false,
          "openCompose"
        ),
      openReply: (to, subject, body, threadId, inReplyTo, references) =>
        set(
          {
            currentView: mailRouteSchema.enum.compose,
            composeState: {
              initialTo: to,
              initialSubject: subject,
              initialBody: body,
              mode: composeModeSchema.enum.reply,
              threadId: threadId,
              inReplyTo: inReplyTo,
              references: references,
            },
          },
          false,
          "openReply"
        ),
      openForward: (subject, body) =>
        set(
          {
            currentView: mailRouteSchema.enum.compose,
            composeState: {
              initialSubject: subject,
              initialBody: body,
              mode: composeModeSchema.enum.forward,
            },
          },
          false,
          "openForward"
        ),
    }),
    { name: "MailStore" }
  )
);
