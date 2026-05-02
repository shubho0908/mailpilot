"use client";

import { cn } from "@/lib/utils";
import { EmailHtmlFrame } from "./emailHtmlFrame";
import type { Email } from "@/services/gmail/gmail.types";

interface ThreadMessageCardProps {
  email: Email;
  isCurrent: boolean;
}

function EmailBody({ email }: { email: Email }) {
  if (email.htmlBody) {
    return (
      <div className="overflow-hidden rounded-lg bg-transparent">
        <EmailHtmlFrame html={email.htmlBody} title={`Email body: ${email.subject}`} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white p-3 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] sm:p-4">
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
        {email.body || email.snippet}
      </div>
    </div>
  );
}

export function ThreadMessageCard({ email, isCurrent }: ThreadMessageCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-white/95 p-3 sm:p-4 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04)] dark:bg-zinc-900/95",
        isCurrent
          ? "border-emerald-500/40 dark:border-emerald-500/50"
          : "border-zinc-200/80 dark:border-zinc-800/80"
      )}
    >
      <div className="mb-3 flex items-start gap-3 sm:gap-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 flex-shrink-0">
          <div className="w-full h-full rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {(email.from.name || email.from.email).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                {email.from.name || email.from.email}
              </h2>
              <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">
                &lt;{email.from.email}&gt;
              </p>
            </div>
            <time className="text-xs text-zinc-400 dark:text-zinc-500 sm:text-right">
              {new Date(email.date).toLocaleString()}
            </time>
          </div>

          {email.to.length > 0 && (
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium tracking-tight">To:</span>{" "}
              {email.to.map((recipient) => recipient.email).join(", ")}
            </div>
          )}
        </div>
      </div>

      <EmailBody email={email} />
    </article>
  );
}
