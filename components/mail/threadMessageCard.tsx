"use client";

import { cn } from "@/lib/utils";
import { EmailHtmlFrame } from "./emailHtmlFrame";
import { DateDisplay } from "@/components/ui/date-display";
import type { Email } from "@/services/gmail/gmail.types";

interface ThreadMessageCardProps {
  email: Email;
  isCurrent: boolean;
}

function EmailBody({ email }: { email: Email }) {
  if (email.htmlBody) {
    return (
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <EmailHtmlFrame html={email.htmlBody} title={`Email body: ${email.subject}`} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-4 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] sm:p-4">
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-900">
        {email.body || email.snippet}
      </div>
    </div>
  );
}

export function ThreadMessageCard({ email, isCurrent }: ThreadMessageCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04)] dark:bg-zinc-900/95 sm:rounded-xl sm:p-4",
        isCurrent
          ? "border-emerald-500/40 dark:border-emerald-500/50"
          : "border-zinc-200/80 dark:border-zinc-800/80"
      )}
    >
      <div className="mb-4 flex items-start gap-3 sm:gap-4">
        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[var(--app-accent)] p-0.5 sm:h-10 sm:w-10">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-white dark:bg-zinc-800">
            <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-base">
              {(email.from.name || email.from.email).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-sm">
                {email.from.name || email.from.email}
              </h2>
              <p className="break-all font-mono text-xs leading-snug text-zinc-500 dark:text-zinc-400 sm:text-xs">
                &lt;{email.from.email}&gt;
              </p>
            </div>
            <time className="text-xs text-zinc-400 dark:text-zinc-500 sm:text-right sm:text-xs">
              <DateDisplay date={email.date} format="string" />
            </time>
          </div>

          {email.to.length > 0 && (
            <div className="mt-2.5 break-all text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
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
