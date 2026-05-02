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
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-xl px-3 py-2.5",
          message.role === "user"
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {message.previews && message.previews.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.previews.map((preview) => (
              <div
                key={preview.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 p-2"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MailOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs font-medium truncate">{preview.fromName}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex-shrink-0">
                    {formatPreviewDate(preview.date)}
                  </span>
                </div>
                <p className="text-xs font-medium truncate">{preview.subject}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                  {preview.snippet}
                </p>
              </div>
            ))}
          </div>
        )}

        <p
          className={cn(
            "text-[10px] mt-1",
            message.role === "user" ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"
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
