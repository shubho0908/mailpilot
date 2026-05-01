"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export function MailNavbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes requires this pattern to prevent hydration mismatch
  // resolvedTheme is undefined during SSR, so we wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-4 left-4 right-4 md:top-6 md:left-1/2 md:right-auto md:-translate-x-1/2 z-40">
      <div className="flex items-center gap-1 sm:gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-2xl px-2 py-2 border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_-4px_rgba(0,0,0,0.3),0_2px_8px_-2px_rgba(0,0,0,0.2)] ring-1 ring-white/50 dark:ring-zinc-600/50">
        <div className="flex items-center gap-2 sm:gap-3 sm:pr-3 pr-2 sm:pr-4 border-r border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.15)]">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-white"
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
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 hidden sm:block">
            MailPilot
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/inbox"
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer ${
              pathname === "/inbox" || pathname.startsWith("/inbox/")
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            Inbox
          </Link>
          <Link
            href="/sent"
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer ${
              pathname === "/sent"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            Sent
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <svg
                  className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )
            ) : (
              <svg
                className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          <Link
            href="/compose"
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-medium tracking-tight transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
