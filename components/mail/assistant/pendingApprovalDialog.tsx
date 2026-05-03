import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import type { AssistantComposeDraft } from "@/lib/assistant/actions";

interface PendingApprovalDialogProps {
  pendingApproval: {
    id: string;
    prompt: string;
    draft?: AssistantComposeDraft;
    deleteEmailId?: string;
  };
  isSending: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingApprovalDialog({
  pendingApproval,
  isSending,
  onApprove,
  onReject,
}: PendingApprovalDialogProps) {
  return (
    <div className="ml-0 rounded-xl border border-[var(--app-accent-border)] bg-[var(--app-accent-soft)] p-3 shadow-[0_1px_4px_-2px_var(--app-shadow)] sm:ml-10">
      <p className="break-words text-sm font-medium text-[var(--app-text)]">
        {pendingApproval.prompt}
      </p>
      {pendingApproval.draft && (
        <p className="mt-1 break-words text-xs text-[var(--app-text-muted)]">
          {pendingApproval.draft.subject} → {pendingApproval.draft.to}
        </p>
      )}
      {pendingApproval.deleteEmailId && (
        <p className="mt-1 break-words text-xs text-[var(--app-text-muted)]">
          This action cannot be undone
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={onApprove}
          disabled={isSending}
          size="sm"
          className="h-8 cursor-pointer rounded-lg bg-[var(--app-accent)] text-xs text-[var(--app-bg)] hover:opacity-90"
        >
          {isSending ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="mr-1 h-3.5 w-3.5" />
          )}
          Approve
        </Button>
        <Button
          onClick={onReject}
          disabled={isSending}
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer rounded-lg border-[var(--app-border)] bg-[var(--app-panel)] text-xs text-[var(--app-text-muted)] hover:bg-[var(--app-soft)] hover:text-[var(--app-text)]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
