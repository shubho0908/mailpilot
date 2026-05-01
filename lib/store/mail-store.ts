import { create } from "zustand";
import { devtools } from "zustand/middleware";

type MailView = "inbox" | "sent" | "compose";

interface MailFilters {
  search: string;
  dateFrom: string | null;
  dateTo: string | null;
  sender: string | null;
}

interface ComposeState {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  mode?: "compose" | "reply" | "forward";
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface MailState {
  currentView: MailView;
  openEmailId: string | null;
  filters: MailFilters;
  composeState: ComposeState | null;
}

interface MailActions {
  setCurrentView: (view: MailView) => void;
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
  currentView: "inbox",
  openEmailId: null,
  filters: {
    search: "",
    dateFrom: null,
    dateTo: null,
    sender: null,
  },
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
        set({ currentView: "compose", composeState: composeState || null }, false, "openCompose"),
      openReply: (to, subject, body, threadId, inReplyTo, references) =>
        set(
          {
            currentView: "compose",
            composeState: {
              initialTo: to,
              initialSubject: subject,
              initialBody: body,
              mode: "reply",
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
            currentView: "compose",
            composeState: { initialSubject: subject, initialBody: body, mode: "forward" },
          },
          false,
          "openForward"
        ),
    }),
    { name: "MailStore" }
  )
);
