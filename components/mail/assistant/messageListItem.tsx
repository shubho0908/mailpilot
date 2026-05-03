import { cn } from "@/lib/utils";
import { MailOpen, MessageSquare } from "lucide-react";
import type { AssistantEmailPreview } from "@/lib/assistant/actions";
import { formatPreviewDate } from "../assistant-utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  previews?: AssistantEmailPreview[];
}

interface MessageListItemProps {
  message: Message;
}

export function MessageListItem({ message }: MessageListItemProps) {
  return (
    <div className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
      {message.role === "assistant" && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
          <MessageSquare className="h-3.5 w-3.5 text-[var(--app-bg)]" strokeWidth={1.7} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-xl px-3 py-2.5 shadow-[0_1px_4px_-2px_var(--app-shadow)]",
          message.role === "user"
            ? "bg-[var(--app-accent)] text-[var(--app-bg)]"
            : "border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)]"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>

        {message.previews && message.previews.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.previews.map((preview) => (
              <div
                key={preview.id}
                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/70 p-2"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MailOpen
                      className="h-3.5 w-3.5 flex-shrink-0 text-[var(--app-accent)]"
                      strokeWidth={1.7}
                    />
                    <p className="text-xs font-medium truncate">{preview.fromName}</p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-[var(--app-text-faint)]">
                    {formatPreviewDate(preview.date)}
                  </span>
                </div>
                <p className="text-xs font-medium truncate">{preview.subject}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-[var(--app-text-muted)]">
                  {preview.snippet}
                </p>
              </div>
            ))}
          </div>
        )}

        <p
          className={cn(
            "text-[10px] mt-1",
            message.role === "user" ? "text-[var(--app-bg)]/70" : "text-[var(--app-text-faint)]"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
