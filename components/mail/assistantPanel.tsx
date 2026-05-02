"use client";

import { useCallback, useMemo, useRef, useReducer, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { useMailStore } from "@/lib/store/mail-store";
import { mailFilterHref } from "@/lib/mail/filter-url";
import { queryKeys } from "@/lib/query-keys";
import { useSendEmail } from "@/hooks/mutations/use-send-email";
import { useDeleteEmail } from "@/hooks/mutations/use-delete-email";
import type {
  AssistantChatMessage,
  AssistantEmailPreview,
  AssistantUiAction,
} from "@/lib/assistant/actions";
import { assistantResponseSchema } from "@/lib/assistant/actions";
import { assistantRoleSchema, mailRouteSchema, pathForMailRoute } from "@/lib/mail/types";
import type { Email } from "@/services/gmail/gmail.types";
import { MessageSquare } from "lucide-react";
import {
  getCurrentView,
  getOpenEmailId,
  draftToComposeState,
  getLatestDraft,
} from "./assistant-utils";
import { toAssistantOpenEmail } from "@/lib/assistant/email-transformers";
import { AssistantPanelHeader } from "./assistant/assistantPanelHeader";
import { AssistantPanelFooter } from "./assistant/assistantPanelFooter";
import {
  AssistantPanelMessagesList,
  type Message,
  type PendingApproval,
} from "./assistant/assistantPanelMessagesList";

interface AssistantToggleProps {
  className?: string;
}

export function AssistantToggle({ className }: AssistantToggleProps = {}) {
  const { isOpen, togglePanel } = useAssistantStore();

  return (
    <button
      onClick={togglePanel}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]",
        isOpen && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        className
      )}
      aria-label="Toggle assistant panel"
    >
      <MessageSquare className="h-4 w-4" />
    </button>
  );
}

interface AssistantPanelState {
  messages: Message[];
  input: string;
  isThinking: boolean;
  error: string | null;
  pendingApproval: PendingApproval | null;
}

type AssistantPanelAction =
  | { type: "SET_MESSAGES"; value: Message[] }
  | { type: "ADD_MESSAGE"; value: Message }
  | { type: "SET_INPUT"; value: string }
  | { type: "SET_THINKING"; value: boolean }
  | { type: "SET_ERROR"; value: string | null }
  | { type: "SET_PENDING_APPROVAL"; value: PendingApproval | null }
  | { type: "RESET" };

function assistantPanelReducer(
  state: AssistantPanelState,
  action: AssistantPanelAction
): AssistantPanelState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.value };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.value] };
    case "SET_INPUT":
      return { ...state, input: action.value };
    case "SET_THINKING":
      return { ...state, isThinking: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_PENDING_APPROVAL":
      return { ...state, pendingApproval: action.value };
    case "RESET":
      return { ...state, messages: [], input: "", error: null, pendingApproval: null };
    default:
      return state;
  }
}

interface AssistantPanelProps {
  className?: string;
}

export function AssistantPanel({ className }: AssistantPanelProps = {}) {
  const router = useRouter();
  const { push } = router;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isOpen, closePanel } = useAssistantStore();
  const filters = useMailStore((state) => state.filters);
  const setOpenEmailId = useMailStore((state) => state.setOpenEmailId);
  const setComposeState = useMailStore((state) => state.setComposeState);
  const { mutate: sendEmail } = useSendEmail();
  const { mutate: deleteEmail } = useDeleteEmail();

  const [state, dispatch] = useReducer(assistantPanelReducer, {
    messages: [],
    input: "",
    isThinking: false,
    error: null,
    pendingApproval: null,
  });

  const { messages, input, isThinking, error, pendingApproval } = state;
  const scrollRef = useRef<HTMLDivElement>(null);

  const compactHistory = useMemo(
    () =>
      messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, pendingApproval]);

  const addAssistantMessage = useCallback((content: string, previews?: AssistantEmailPreview[]) => {
    dispatch({
      type: "ADD_MESSAGE",
      value: {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date(),
        previews,
      },
    });
  }, []);

  const executeActions = useCallback(
    (actions: AssistantUiAction[]) => {
      for (const action of actions) {
        if (action.type === "navigate") {
          push(action.path);
        }

        if (action.type === "setFilters") {
          push(
            mailFilterHref(action.view, {
              search: action.filters.search ?? "",
              sender: action.filters.sender ?? null,
              dateFrom: action.filters.dateFrom ?? null,
              dateTo: action.filters.dateTo ?? null,
              unread: action.filters.unread ?? null,
              maxResults: action.filters.maxResults ?? null,
            })
          );
        }

        if (action.type === "clearFilters") {
          if (action.view) {
            push(pathForMailRoute(action.view));
          }
        }

        if (action.type === "openEmail") {
          setOpenEmailId(action.emailId);
          push(`${pathForMailRoute(action.view)}/${action.emailId}`);
        }

        if (action.type === "composeDraft") {
          setComposeState(draftToComposeState(action.draft));
          push(pathForMailRoute(mailRouteSchema.enum.compose));

          if (action.requiresApproval) {
            dispatch({
              type: "SET_PENDING_APPROVAL",
              value: {
                id: crypto.randomUUID(),
                prompt: action.approvalPrompt || `Send this email to ${action.draft.to}?`,
                draft: action.draft,
              },
            });
          }
        }

        if (action.type === "deleteEmail") {
          if (action.requiresApproval) {
            dispatch({
              type: "SET_PENDING_APPROVAL",
              value: {
                id: crypto.randomUUID(),
                prompt: action.approvalPrompt || "Delete this email?",
                deleteEmailId: action.emailId,
              },
            });
          } else {
            deleteEmail(
              { id: action.emailId },
              {
                onSuccess: () => {
                  addAssistantMessage("Email deleted successfully.");
                  push(pathForMailRoute(mailRouteSchema.enum.inbox));
                },
                onError: (deleteError) => {
                  dispatch({
                    type: "SET_ERROR",
                    value:
                      deleteError instanceof Error ? deleteError.message : "Failed to delete email",
                  });
                },
              }
            );
          }
        }
      }
    },
    [push, setComposeState, setOpenEmailId, deleteEmail, addAssistantMessage]
  );

  const handleSendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || isThinking) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const outgoingMessages: AssistantChatMessage[] = [
      ...compactHistory,
      { role: assistantRoleSchema.enum.user, content },
    ];

    dispatch({
      type: "ADD_MESSAGE",
      value: userMessage,
    });
    dispatch({ type: "SET_INPUT", value: "" });
    dispatch({ type: "SET_ERROR", value: null });
    dispatch({ type: "SET_THINKING", value: true });

    try {
      const openEmailId = getOpenEmailId(pathname);
      let openEmail = undefined;

      if (openEmailId) {
        const cachedThreadData = queryClient.getQueryData<{ email: Email }>(
          queryKeys.email.thread(openEmailId)
        );
        const cachedDetailData = queryClient.getQueryData<Email | { email: Email }>(
          queryKeys.email.detail(openEmailId)
        );
        const cachedEmail =
          cachedThreadData?.email ||
          (cachedDetailData && "email" in cachedDetailData
            ? cachedDetailData.email
            : cachedDetailData);

        if (cachedEmail) {
          openEmail = toAssistantOpenEmail(cachedEmail);
        }
      }

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoingMessages,
          context: {
            pathname,
            currentView: getCurrentView(pathname),
            openEmailId,
            openEmail,
            filters,
            currentDate: new Date().toISOString().split("T")[0],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Assistant request failed");
      }

      const data = assistantResponseSchema.parse(await response.json());
      addAssistantMessage(data.message, data.previews);
      executeActions(data.actions || []);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Assistant request failed";
      dispatch({ type: "SET_ERROR", value: message });
    } finally {
      dispatch({ type: "SET_THINKING", value: false });
    }
  }, [
    addAssistantMessage,
    compactHistory,
    executeActions,
    filters,
    input,
    isThinking,
    pathname,
    queryClient,
  ]);

  const handleApproveSend = useCallback(() => {
    if (!pendingApproval) return;

    dispatch({ type: "SET_ERROR", value: null });

    if (pendingApproval.deleteEmailId) {
      deleteEmail(
        { id: pendingApproval.deleteEmailId },
        {
          onSuccess: () => {
            dispatch({ type: "SET_PENDING_APPROVAL", value: null });
            push(pathForMailRoute(mailRouteSchema.enum.inbox));
          },
          onError: (deleteError) => {
            dispatch({
              type: "SET_ERROR",
              value: deleteError instanceof Error ? deleteError.message : "Failed to delete email",
            });
          },
        }
      );
    } else if (pendingApproval.draft) {
      const draft = getLatestDraft(pendingApproval.draft);
      sendEmail(
        {
          to: draft.to,
          subject: draft.subject,
          body: draft.body,
          cc: draft.cc,
          bcc: draft.bcc,
          threadId: draft.threadId,
          inReplyTo: draft.inReplyTo,
          references: draft.references,
        },
        {
          onSuccess: () => {
            dispatch({ type: "SET_PENDING_APPROVAL", value: null });
            setComposeState(null);
            push(pathForMailRoute(mailRouteSchema.enum.sent));
          },
          onError: (sendError) => {
            dispatch({
              type: "SET_ERROR",
              value: sendError instanceof Error ? sendError.message : "Failed to send email",
            });
          },
        }
      );
    }
  }, [pendingApproval, push, sendEmail, setComposeState, deleteEmail]);

  const handleRejectSend = useCallback(() => {
    if (!pendingApproval) return;
    dispatch({ type: "SET_PENDING_APPROVAL", value: null });
    if (pendingApproval.deleteEmailId) {
      addAssistantMessage("Delete cancelled. The email was not deleted.");
    } else {
      addAssistantMessage("Send cancelled. The draft is still open for editing.");
    }
  }, [addAssistantMessage, pendingApproval]);

  const handleClearConversation = useCallback(() => {
    dispatch({ type: "SET_MESSAGES", value: [] });
    dispatch({ type: "SET_PENDING_APPROVAL", value: null });
    dispatch({ type: "SET_ERROR", value: null });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 h-full flex flex-col",
        "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl",
        "shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)]",
        "ring-1 ring-black/[0.02] dark:ring-white/[0.05]",
        "transition-transform duration-300 ease-out",
        "border-l border-zinc-200/50 dark:border-zinc-800/50",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      style={{ width: "400px", maxWidth: "calc(100vw - 2rem)" }}
    >
      <AssistantPanelHeader onClose={closePanel} isThinking={isThinking} />

      <div
        className="overflow-y-auto p-3"
        ref={scrollRef}
        style={{ height: "calc(100vh - 148px)" }}
      >
        <AssistantPanelMessagesList
          messages={messages}
          error={error}
          pendingApproval={pendingApproval}
          isThinking={isThinking}
          onApproveSend={handleApproveSend}
          onRejectSend={handleRejectSend}
        />
      </div>

      <AssistantPanelFooter
        messages={messages}
        input={input}
        onKeyDown={handleKeyDown}
        isThinking={isThinking}
        onSendMessage={handleSendMessage}
        onInputChange={(value: string) => dispatch({ type: "SET_INPUT", value })}
        onClearConversation={handleClearConversation}
      />
    </div>
  );
}
