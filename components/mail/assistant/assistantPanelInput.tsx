import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface AssistantPanelInputProps {
  value: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled: boolean;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
}

export function AssistantPanelInput({
  value,
  onKeyDown,
  disabled,
  onSendMessage,
  onInputChange,
}: AssistantPanelInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Tell me what to do..."
        className="flex-1 h-9 text-sm"
        disabled={disabled}
      />
      <Button
        onClick={onSendMessage}
        disabled={!value.trim() || disabled}
        size="icon"
        className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
