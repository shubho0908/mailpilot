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
    <div className="ml-10 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3">
      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
        {pendingApproval.prompt}
      </p>
      {pendingApproval.draft && (
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200 break-words">
          {pendingApproval.draft.subject} → {pendingApproval.draft.to}
        </p>
      )}
      {pendingApproval.deleteEmailId && (
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200 break-words">
          This action cannot be undone
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={onApprove}
          disabled={isSending}
          size="sm"
          className="h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
        >
          {isSending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 mr-1" />
          )}
          Approve
        </Button>
        <Button
          onClick={onReject}
          disabled={isSending}
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
