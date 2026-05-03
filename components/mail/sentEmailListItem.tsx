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
                    {(email.to[0]?.name || email.to[0]?.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)] truncate">
                    {email.to[0]?.name || email.to[0]?.email}
                  </h3>
                  <p className="text-xs text-[var(--app-text-faint)] mt-0.5 tracking-tight truncate">
                    {email.to[0]?.email}
                  </p>
                </div>
                <span className="text-xs text-[var(--app-text-faint)] whitespace-nowrap tracking-tight sm:flex-shrink-0">
                  <DateDisplay date={email.date} format="date" />
                </span>
              </div>

              <h4 className="mb-1 break-words text-xs leading-tight text-[var(--app-text-muted)] sm:text-sm">
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
