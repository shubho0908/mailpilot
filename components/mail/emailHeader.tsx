"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateDisplay } from "@/components/ui/date-display";
import type { Email } from "@/services/gmail/gmail.types";
import { Paperclip, Star, Reply, Forward, Trash2 } from "lucide-react";

interface EmailHeaderProps {
  email: Email;
  threadMessages: Email[];
  onReply: () => void;
  onForward: () => void;
  onDelete?: () => void;
}

export function EmailHeader({
  email,
  threadMessages,
  onReply,
  onForward,
  onDelete,
}: EmailHeaderProps) {
  return (
    <div className="mb-5 border-b border-zinc-200/60 pb-5 dark:border-zinc-800/60 sm:mb-6 sm:pb-6">
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="break-words text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.035em] text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {email.subject}
          </h1>
          {email.unread && (
            <Badge className="w-fit rounded-md px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-500/20">
              Unread
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-[var(--app-accent)] p-0.5 sm:h-14 sm:w-14">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-white dark:bg-zinc-800">
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                  {(email.from.name || email.from.email).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-lg">
                {email.from.name || email.from.email}
              </h2>
              <span className="break-all font-mono text-[0.8rem] leading-snug text-zinc-500 dark:text-zinc-400 sm:text-sm">
                {email.from.email}
              </span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <DateDisplay date={email.date} format="string" />
            </div>

            {email.to.length > 0 && (
              <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">To:</span>{" "}
                <span className="break-all font-mono text-xs">
                  {email.to.map((recipient: { email: string }) => recipient.email).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto lg:flex-shrink-0">
          <div className="flex w-full flex-nowrap items-center gap-2 sm:w-auto">
            <Button
              onClick={onReply}
              size="sm"
              className="h-9 min-w-[44px] px-2 text-xs font-medium rounded-lg bg-zinc-900 text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
            >
              <Reply className="h-4 w-4" />
              <span className="ml-1.5">Reply</span>
            </Button>
            <Button
              onClick={onForward}
              size="sm"
              className="h-9 min-w-[44px] px-2 text-xs font-medium rounded-lg bg-zinc-900 text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
            >
              <Forward className="h-4 w-4" />
              <span className="ml-1.5">Forward</span>
            </Button>
            {onDelete && (
              <Button
                onClick={onDelete}
                size="sm"
                className="h-9 min-w-[44px] px-2 text-xs font-medium rounded-lg bg-red-600 text-white shadow-sm shadow-red-500/20 transition-all duration-200 hover:bg-red-700 dark:bg-red-600 dark:text-white dark:shadow-red-500/30 dark:hover:bg-red-700 sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1.5">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {threadMessages.length > 1 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <svg
              className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {threadMessages.length} {threadMessages.length === 1 ? "message" : "messages"}
            </span>
          </div>
        )}
        {email.starred && (
          <Badge
            variant="outline"
            className="gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Starred
          </Badge>
        )}
        {email.attachments.length > 0 && (
          <Badge
            variant="outline"
            className="gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
