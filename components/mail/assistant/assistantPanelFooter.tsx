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
    <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 p-3 space-y-2">
      {messages.length > 0 && (
        <Button
          onClick={onClearConversation}
          variant="ghost"
          size="sm"
          className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear conversation
        </Button>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tell me what to do..."
          className="flex-1 h-9 text-sm"
          disabled={isThinking}
        />
        <Button
          onClick={onSendMessage}
          disabled={!input.trim() || isThinking}
          size="icon"
          className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
