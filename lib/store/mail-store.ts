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

interface MailState {
  currentView: MailRoute;
  openEmailId: string | null;
  filters: MailFilters;
  composeState: ComposeState | null;
}

interface MailActions {
  setCurrentView: (view: MailRoute) => void;
  setOpenEmailId: (id: string | null) => void;
  setFilters: (filters: Partial<MailFilters>) => void;
  clearFilters: () => void;
  resetToInbox: () => void;
  setComposeState: (state: ComposeState | null) => void;
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

const initialState: MailState = {
  currentView: mailRouteSchema.enum.inbox,
  openEmailId: null,
  filters: emptyMailFilters,
  composeState: null,
};

export const useMailStore = create<MailStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setCurrentView: (view) =>
        set({ currentView: view, openEmailId: null, composeState: null }, false, "setCurrentView"),
      setOpenEmailId: (id) => set({ openEmailId: id }, false, "setOpenEmailId"),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } }), false, "setFilters"),
      clearFilters: () => set({ filters: initialState.filters }, false, "clearFilters"),
      resetToInbox: () => set(initialState, false, "resetToInbox"),
      setComposeState: (composeState) => set({ composeState }, false, "setComposeState"),
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
