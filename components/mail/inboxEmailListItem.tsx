"use client";

import { memo, useCallback } from "react";
import type { Email } from "@/services/gmail/gmail.types";

interface EmailListItemProps {
  email: Email;
  onClick: (id: string) => void;
  index: number;
}

const EmailListItem = memo(({ email, onClick, index }: EmailListItemProps) => {
  const handleClick = useCallback(() => {
    onClick(email.id);
  }, [email.id, onClick]);

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        animationDelay: `${index * 30}ms`,
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_-1px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_12px_-1px_rgba(0,0,0,0.4),0_2px_6px_-1px_rgba(0,0,0,0.3)] transition-shadow duration-300">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5">
                <div className="w-full h-full rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center">
                  <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {(email.from.name || email.from.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              {email.unread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xs sm:text-sm font-medium tracking-tight ${email.unread ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"} transition-colors duration-300 truncate`}
                  >
                    {email.from.name || email.from.email}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-tight truncate">
                    {email.from.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {email.starred && (
                    <svg
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {email.attachments.length > 0 && (
                    <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <svg
                        className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {email.attachments.length}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap tracking-tight">
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h4
                className={`text-xs sm:text-sm mb-1 leading-tight ${email.unread ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}
              >
                {email.subject}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {email.snippet}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/[0.02] to-teal-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
});

EmailListItem.displayName = "EmailListItem";

export default EmailListItem;
