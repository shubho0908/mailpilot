"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { useMailStore } from "@/lib/store/mail-store";
import { mailFilterHref } from "@/lib/mail/filter-url";
import { queryKeys } from "@/lib/query-keys";
import { useSendEmail } from "@/hooks/mutations/use-send-email";
import type {
  AssistantChatMessage,
  AssistantComposeDraft,
  AssistantEmailPreview,
  AssistantUiAction,
} from "@/lib/assistant/actions";
import { assistantResponseSchema } from "@/lib/assistant/actions";
import { assistantRoleSchema, mailRouteSchema, pathForMailRoute } from "@/lib/mail/types";
import type { Email } from "@/services/gmail/gmail.types";
import { AlertCircle, Loader2, MessageSquare, Send, Trash2, X } from "lucide-react";
import {
  getCurrentView,
  getOpenEmailId,
  draftToComposeState,
  getLatestDraft,
} from "./assistant-utils";
import { toAssistantOpenEmail } from "@/lib/assistant/email-transformers";
import { MessageListItem } from "./assistant/messageListItem";
import { PendingApprovalDialog } from "./assistant/pendingApprovalDialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  previews?: AssistantEmailPreview[];
}

interface PendingApproval {
  id: string;
  prompt: string;
  draft: AssistantComposeDraft;
}

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

interface AssistantPanelProps {
  className?: string;
}

export function AssistantPanel({ className }: AssistantPanelProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isOpen, closePanel } = useAssistantStore();
  const filters = useMailStore((state) => state.filters);
  const setOpenEmailId = useMailStore((state) => state.setOpenEmailId);
  const setComposeState = useMailStore((state) => state.setComposeState);
  const { mutate: sendEmail, isPending: isSending } = useSendEmail();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addAssistantMessage = useCallback((content: string, previews?: AssistantEmailPreview[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date(),
        previews,
      },
    ]);
  }, []);

  const executeActions = useCallback(
    (actions: AssistantUiAction[]) => {
      for (const action of actions) {
        if (action.type === "navigate") {
          router.push(action.path);
        }

        if (action.type === "setFilters") {
          router.push(
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
            router.push(pathForMailRoute(action.view));
          }
        }

        if (action.type === "openEmail") {
          setOpenEmailId(action.emailId);
          router.push(`${pathForMailRoute(action.view)}/${action.emailId}`);
        }

        if (action.type === "composeDraft") {
          setComposeState(draftToComposeState(action.draft));
          router.push(pathForMailRoute(mailRouteSchema.enum.compose));

          if (action.requiresApproval) {
            setPendingApproval({
              id: crypto.randomUUID(),
              prompt: action.approvalPrompt || `Send this email to ${action.draft.to}?`,
              draft: action.draft,
            });
          }
        }
      }
    },
    [router, setComposeState, setOpenEmailId]
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsThinking(true);

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
      setError(message);
    } finally {
      setIsThinking(false);
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

    const draft = getLatestDraft(pendingApproval.draft);
    setError(null);

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
          setPendingApproval(null);
          setComposeState(null);
          addAssistantMessage("Approved. I sent the email and moved you to Sent.");
          router.push(pathForMailRoute(mailRouteSchema.enum.sent));
        },
        onError: (sendError) => {
          setError(sendError instanceof Error ? sendError.message : "Failed to send email");
        },
      }
    );
  }, [addAssistantMessage, pendingApproval, router, sendEmail, setComposeState]);

  const handleRejectSend = useCallback(() => {
    setPendingApproval(null);
    addAssistantMessage("Send cancelled. The draft is still open for editing.");
  }, [addAssistantMessage]);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setPendingApproval(null);
    setError(null);
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.15)]">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">AI Assistant</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isThinking ? "Planning UI actions..." : "Ready to drive the UI"}
            </p>
          </div>
        </div>
        <Button
          onClick={closePanel}
          variant="ghost"
          size="icon-xs"
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div
        className="overflow-y-auto p-3"
        ref={scrollRef}
        style={{ height: "calc(100vh - 148px)" }}
      >
        <div className="space-y-4">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3">
                <MessageSquare className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Ask me to operate your mailbox
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-64">
                Try “show unread emails this week” or “send john@example.com a meeting note”.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageListItem key={message.id} message={message} />
          ))}

          {pendingApproval && (
            <PendingApprovalDialog
              pendingApproval={pendingApproval}
              isSending={isSending}
              onApprove={handleApproveSend}
              onReject={handleRejectSend}
            />
          )}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Planning</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what to do..."
            className="flex-1 h-9 text-sm"
            disabled={isThinking}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isThinking}
            size="icon"
            className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isThinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {messages.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={handleClearConversation}
              variant="ghost"
              size="xs"
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
