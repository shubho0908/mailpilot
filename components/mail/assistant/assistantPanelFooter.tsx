import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import type { Message } from "./assistantPanelMessagesList";

interface AssistantPanelFooterProps {
  messages: Message[];
  input: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isThinking: boolean;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  onClearConversation: () => void;
}

export function AssistantPanelFooter({
  messages,
  input,
  onKeyDown,
  isThinking,
  onSendMessage,
  onInputChange,
  onClearConversation,
}: AssistantPanelFooterProps) {
  return (
    <div className="app-shell shrink-0 space-y-2 border-t border-[var(--app-border)] bg-[var(--app-panel)]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
      {messages.length > 0 && (
        <Button
          onClick={onClearConversation}
          variant="ghost"
          className="app-btn-secondary w-full text-xs text-[var(--app-text-muted)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
        >
          <Trash2 className="w-3 h-3 mr-1" strokeWidth={1.7} />
          Clear conversation
        </Button>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tell me what to do..."
          className="app-input flex-1 h-10 text-sm"
          disabled={isThinking}
        />
        <Button
          onClick={onSendMessage}
          disabled={!input.trim() || isThinking}
          size="icon"
          className="app-btn-primary h-10 w-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
        >
          <Send className="w-4 h-4" strokeWidth={1.7} />
        </Button>
      </div>
    </div>
  );
}
