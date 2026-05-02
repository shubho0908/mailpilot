"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AssistantToggle } from "./assistantPanel";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { cn } from "@/lib/utils";
import { mailRouteSchema, mailViewSchema, pathForMailRoute } from "@/lib/mail/types";

export function MailNavbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted] = useState(false);
  const { isOpen } = useAssistantStore();
  const inboxPath = pathForMailRoute(mailViewSchema.enum.inbox);
  const sentPath = pathForMailRoute(mailViewSchema.enum.sent);
  const composePath = pathForMailRoute(mailRouteSchema.enum.compose);

  return (
    <nav
      className={cn(
        "fixed top-0 left-1/2 z-40 px-4 sm:px-6 transition-transform duration-300 ease-out",
        isOpen && "-translate-x-[calc(50%+200px)]",
        !isOpen && "-translate-x-1/2"
      )}
      suppressHydrationWarning
    >
      <div className="flex items-center justify-between gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-2xl px-3 py-2.5 mt-3 sm:mt-4 border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_-4px_rgba(0,0,0,0.3),0_2px_8px_-2px_rgba(0,0,0,0.2)] ring-1 ring-white/50 dark:ring-zinc-600/50">
        <div className="flex items-center gap-2.5 pr-3 border-r border-zinc-200/60 dark:border-zinc-800/60 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.15)]">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 hidden sm:block">
            MailPilot
          </span>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-center">
          <Link
            href={inboxPath}
            className={`px-3 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap ${
              pathname === inboxPath || pathname.startsWith(`${inboxPath}/`)
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            Inbox
          </Link>
          <Link
            href={sentPath}
            className={`px-3 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap ${
              pathname === sentPath
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            Sent
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12 a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12 a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          <AssistantToggle />

          <Link
            href={composePath}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 dark:bg-emerald-600 !text-white text-sm font-medium tracking-tight transition-all duration-200 hover:bg-emerald-600 dark:hover:bg-emerald-700 shadow-[0_1px_3px_-1px_rgba(16,185,129,0.2)] cursor-pointer [&_svg]:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">New</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
