"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Email } from "@/services/gmail/gmail.types";

interface EmailHeaderProps {
  email: Email;
  threadMessages: Email[];
  onReply: () => void;
  onForward: () => void;
}

export function EmailHeader({ email, threadMessages, onReply, onForward }: EmailHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50 max-w-4xl">
          {email.subject}
        </h1>
      </div>

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5">
            <div className="w-full h-full rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {(email.from.name || email.from.email).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
            <h2 className="text-sm sm:text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              {email.from.name || email.from.email}
            </h2>
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 break-all">
              &lt;{email.from.email}&gt;
            </span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 sm:mb-3 tracking-tight">
            {new Date(email.date).toLocaleString()}
          </p>

          {email.to.length > 0 && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium tracking-tight">To:</span>{" "}
              {email.to.map((recipient: { email: string }) => recipient.email).join(", ")}
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col gap-2">
          <Button
            onClick={onReply}
            className="rounded-lg px-3 sm:px-5 h-9 sm:h-10 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            Reply
          </Button>
          <Button
            variant="outline"
            onClick={onForward}
            className="rounded-lg px-3 sm:px-5 h-9 sm:h-10 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            Forward
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
        {threadMessages.length > 1 && (
          <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 text-xs">
            Conversation - {threadMessages.length} messages
          </Badge>
        )}
        {email.unread && (
          <Badge className="rounded-full px-2 sm:px-3 py-1 bg-emerald-500 text-white text-xs font-medium">
            Unread
          </Badge>
        )}
        {email.starred && (
          <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 text-xs">
            Starred
          </Badge>
        )}
        {email.attachments.length > 0 && (
          <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 text-xs">
            {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
