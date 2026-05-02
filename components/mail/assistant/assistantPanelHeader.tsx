import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";

interface AssistantPanelHeaderProps {
  onClose: () => void;
  isThinking: boolean;
}

export function AssistantPanelHeader({ onClose, isThinking }: AssistantPanelHeaderProps) {
  return (
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
        onClick={onClose}
        variant="ghost"
        size="icon-xs"
        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
