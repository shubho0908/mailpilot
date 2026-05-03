import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { MessageListItem } from "./messageListItem";
import { PendingApprovalDialog } from "./pendingApprovalDialog";
import type { AssistantEmailPreview, AssistantComposeDraft } from "@/lib/assistant/actions";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  previews?: AssistantEmailPreview[];
}

export interface PendingApproval {
  id: string;
  prompt: string;
  draft?: AssistantComposeDraft;
  deleteEmailId?: string;
}

interface AssistantPanelMessagesListProps {
  messages: Message[];
  error: string | null;
  pendingApproval: PendingApproval | null;
  isThinking: boolean;
  onApproveSend: () => void;
  onRejectSend: () => void;
  isSending: boolean;
}

export function AssistantPanelMessagesList({
  messages,
  error,
  pendingApproval,
  isThinking,
  onApproveSend,
  onRejectSend,
  isSending,
}: AssistantPanelMessagesListProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <MessageSquare className="h-6 w-6 text-[var(--app-text-faint)]" strokeWidth={1.7} />
          </div>
          <p className="mb-1 text-sm font-medium text-[var(--app-text)]">
            Ask me to operate your mailbox
          </p>
          <p className="max-w-64 text-xs leading-relaxed text-[var(--app-text-muted)]">
            Try &quot;show unread emails this week&quot; or &quot;send john@example.com a meeting
            note&quot;.
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
          onApprove={onApproveSend}
          onReject={onRejectSend}
        />
      )}

      {isThinking && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
            <MessageSquare className="h-3.5 w-3.5 text-[var(--app-bg)]" strokeWidth={1.7} />
          </div>
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2.5">
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--app-text-faint)]" />
              <span className="text-xs text-[var(--app-text-muted)]">Planning</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
