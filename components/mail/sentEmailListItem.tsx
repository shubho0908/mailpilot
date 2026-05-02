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
      className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        animationDelay: `${index * 30}ms`,
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
      <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_-1px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_12px_-1px_rgba(0,0,0,0.4),0_2px_6px_-1px_rgba(0,0,0,0.3)] transition-shadow duration-300">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-0.5">
                <div className="w-full h-full rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center">
                  <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {(email.to[0]?.name || email.to[0]?.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                    {email.to[0]?.name || email.to[0]?.email}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-tight truncate">
                    {email.to[0]?.email}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap tracking-tight">
                  <DateDisplay date={email.date} format="date" />
                </span>
              </div>

              <h4 className="text-xs sm:text-sm mb-1 leading-tight text-zinc-700 dark:text-zinc-300">
                {email.subject}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {email.snippet}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.02] to-orange-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
});

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
