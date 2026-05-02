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
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3">
            <MessageSquare className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Ask me to operate your mailbox
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-64">
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
  );
}
