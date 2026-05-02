"use client";

import { useCallback, useMemo, useRef, useReducer, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { mailRouteSchema, pathForMailRoute } from "@/lib/mail/types";
import type { Email } from "@/services/gmail/gmail.types";
import {
  getCurrentView,
  getOpenEmailId,
  draftToComposeState,
  getLatestDraft,
} from "../assistant-utils";
import { toAssistantOpenEmail } from "@/lib/assistant/email-transformers";
import type { Message } from "./assistantPanelMessagesList";
import { assistantPanelReducer } from "./assistant-panel-reducer";

export function useAssistantPanel() {
  const router = useRouter();
  const { push } = router;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { closePanel } = useAssistantStore();
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
  const [isSending, setIsSending] = useState(false);

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

    const outgoingMessages: AssistantChatMessage[] = [...compactHistory, { role: "user", content }];

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closePanel]);

  const handleApproveSend = useCallback(() => {
    if (!pendingApproval) return;

    setIsSending(true);
    dispatch({ type: "SET_ERROR", value: null });

    if (pendingApproval.deleteEmailId) {
      deleteEmail(
        { id: pendingApproval.deleteEmailId },
        {
          onSuccess: () => {
            setIsSending(false);
            dispatch({ type: "SET_PENDING_APPROVAL", value: null });
            push(pathForMailRoute(mailRouteSchema.enum.inbox));
          },
          onError: (deleteError) => {
            setIsSending(false);
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
            setIsSending(false);
            dispatch({ type: "SET_PENDING_APPROVAL", value: null });
            setComposeState(null);
            push(pathForMailRoute(mailRouteSchema.enum.sent));
          },
          onError: (sendError) => {
            setIsSending(false);
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

  return {
    messages,
    input,
    isThinking,
    error,
    pendingApproval,
    scrollRef,
    isSending,
    onSendMessage: handleSendMessage,
    onApproveSend: handleApproveSend,
    onRejectSend: handleRejectSend,
    onClearConversation: handleClearConversation,
    onKeyDown: handleKeyDown,
    onInputChange: (value: string) => dispatch({ type: "SET_INPUT", value }),
  };
}
