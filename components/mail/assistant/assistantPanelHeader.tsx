import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";

interface AssistantPanelHeaderProps {
  onClose: () => void;
  isThinking: boolean;
}

export function AssistantPanelHeader({ onClose, isThinking }: AssistantPanelHeaderProps) {
  return (
    <div className="app-shell flex shrink-0 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-panel)]/95 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--app-accent)] shadow-[0_2px_8px_-1px_var(--app-shadow)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5">
          <MessageSquare className="w-4 h-4 text-[var(--app-bg)]" strokeWidth={1.7} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">AI Assistant</h3>
          <p className="text-xs text-[var(--app-text-muted)]">
            {isThinking ? "Planning UI actions..." : "Ready to drive the UI"}
          </p>
        </div>
      </div>
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        aria-label="Close assistant panel"
        className="w-8 h-8 rounded-xl bg-[var(--app-soft)] text-[var(--app-text-muted)] hover:bg-[var(--app-border-strong)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
      >
        <X className="w-4 h-4" strokeWidth={1.7} />
      </Button>
    </div>
  );
}
