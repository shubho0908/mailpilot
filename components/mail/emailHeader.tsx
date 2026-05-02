"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateDisplay } from "@/components/ui/date-display";
import type { Email } from "@/services/gmail/gmail.types";

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
    <div className="mb-6 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
      {/* Subject Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {email.subject}
        </h1>
      </div>

      {/* Main Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left: Sender Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {(email.from.name || email.from.email).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Sender Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {email.from.name || email.from.email}
              </h2>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 break-all font-mono">
                {email.from.email}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-3">
              <DateDisplay date={email.date} format="string" />
            </div>

            {email.to.length > 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">To:</span>{" "}
                <span className="font-mono text-xs">
                  {email.to.map((recipient: { email: string }) => recipient.email).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 p-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 backdrop-blur-sm">
            <Button
              onClick={onReply}
              size="sm"
              className="h-9 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
            >
              Reply
            </Button>
            <Button
              variant="outline"
              onClick={onForward}
              size="sm"
              className="h-9 px-4 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-medium text-sm transition-all duration-200"
            >
              Forward
            </Button>
            {onDelete && <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />}
            {onDelete && (
              <Button
                variant="ghost"
                onClick={onDelete}
                size="sm"
                className="h-9 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium text-sm transition-all duration-200"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-5">
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
        {email.unread && (
          <Badge className="rounded-md px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-500/20">
            Unread
          </Badge>
        )}
        {email.starred && (
          <Badge
            variant="outline"
            className="rounded-md px-3 py-1.5 text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
          >
            ⭐ Starred
          </Badge>
        )}
        {email.attachments.length > 0 && (
          <Badge
            variant="outline"
            className="rounded-md px-3 py-1.5 text-xs font-semibold border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
          >
            📎 {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
