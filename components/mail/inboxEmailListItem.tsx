"use client";

import { memo, useCallback } from "react";
import { DateDisplay } from "@/components/ui/date-display";
import type { Email } from "@/services/gmail/gmail.types";

interface EmailListItemProps {
  email: Email;
  onClick: (id: string) => void;
  index: number;
}

const EmailListItem = memo(({ email, onClick, index }: EmailListItemProps) => {
  const handleSelectEmail = useCallback(() => {
    onClick(email.id);
  }, [email.id, onClick]);

  return (
    <div
      onClick={handleSelectEmail}
      className="app-reveal group relative cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        animationDelay: `${index * 40}ms`,
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelectEmail();
        }
      }}
    >
      <div className="app-card relative p-1 transition-shadow duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_4px_16px_-1px_var(--app-shadow-strong),0_2px_8px_-1px_var(--app-shadow)]">
        <div className="bg-[var(--app-panel)] rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--app-accent)] p-0.5 shadow-[0_2px_8px_-1px_var(--app-shadow)]">
                <div className="w-full h-full rounded-lg bg-[var(--app-bg)] flex items-center justify-center">
                  <span className="text-base sm:text-lg font-semibold tracking-tight text-[var(--app-accent)]">
                    {(email.from.name || email.from.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              {email.unread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--app-accent)] rounded-full ring-2 ring-[var(--app-panel)]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xs sm:text-sm font-medium tracking-tight ${email.unread ? "text-[var(--app-text)]" : "text-[var(--app-text-muted)"} transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] truncate`}
                  >
                    {email.from.name || email.from.email}
                  </h3>
                  <p className="text-xs text-[var(--app-text-faint)] mt-0.5 tracking-tight truncate">
                    {email.from.email}
                  </p>
                </div>
                <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:flex-shrink-0 sm:gap-2">
                  {email.starred && (
                    <svg
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {email.attachments.length > 0 && (
                    <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-[var(--app-soft)]">
                      <svg
                        className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[var(--app-text-muted)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.7}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-xs text-[var(--app-text)] font-medium">
                        {email.attachments.length}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-[var(--app-text-faint)] whitespace-nowrap tracking-tight">
                    <DateDisplay date={email.date} format="date" />
                  </span>
                </div>
              </div>

              <h4
                className={`mb-1 break-words text-xs leading-tight sm:text-sm ${email.unread ? "font-medium text-[var(--app-text)]" : "text-[var(--app-text-muted)]"}`}
              >
                {email.subject}
              </h4>
              <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 leading-relaxed">
                {email.snippet}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl bg-[var(--app-accent)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none" />
    </div>
  );
});

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
