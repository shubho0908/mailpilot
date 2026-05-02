"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AssistantToggle } from "./assistant/assistantToggle";
import { SyncStatusIndicator } from "./syncStatus";
import { UserProfileDropdown } from "@/components/user/userProfileDropdown";
import { mailRouteSchema, mailViewSchema, pathForMailRoute } from "@/lib/mail/types";

export function MailNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const inboxPath = pathForMailRoute(mailViewSchema.enum.inbox);
  const sentPath = pathForMailRoute(mailViewSchema.enum.sent);
  const composePath = pathForMailRoute(mailRouteSchema.enum.compose);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden transition-opacity duration-300 ease-out ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <nav className="fixed top-0 left-1/2 z-40 w-full max-w-[calc(100vw-1rem)] -translate-x-1/2 px-2 sm:w-auto sm:max-w-none sm:px-6">
        <header className="flex flex-col bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-2xl mt-3 sm:mt-4 border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_-4px_rgba(0,0,0,0.3),0_2px_8px_-2px_rgba(0,0,0,0.2)] ring-1 ring-white/50 dark:ring-zinc-600/50 transition-all duration-300 ease-out">
          <div className="flex items-center justify-between gap-1 px-2 py-2.5 sm:gap-2 sm:px-3">
            <div className="flex items-center gap-2.5 pr-3 border-zinc-200/60 dark:border-zinc-800/60 flex-shrink-0 md:border-r md:pr-3">
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
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                MailPilot
              </span>
            </div>

            <ul className="hidden sm:flex items-center gap-1 flex-1 justify-center m-0 p-0 list-none">
              <li>
                <Link
                  href={inboxPath}
                  className={`px-2.5 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap sm:px-3 ${
                    pathname === inboxPath || pathname.startsWith(`${inboxPath}/`)
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  Inbox
                </Link>
              </li>
              <li>
                <Link
                  href={sentPath}
                  className={`px-2.5 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap sm:px-3 ${
                    pathname === sentPath
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  Sent
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <SyncStatusIndicator />

                <AssistantToggle />

                <Link
                  href={composePath}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-500 dark:bg-emerald-600 !text-white text-sm font-medium tracking-tight transition-all duration-200 hover:bg-emerald-600 dark:hover:bg-emerald-700 shadow-[0_1px_3px_-1px_rgba(16,185,129,0.2)] cursor-pointer sm:px-3 [&_svg]:text-white"
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

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="sm:hidden">
                <UserProfileDropdown />
              </div>
            </div>
          </div>

          <section
            className={`sm:hidden overflow-hidden transition-all duration-300 ease-out ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
            aria-label="Mobile navigation menu"
          >
            <nav className="px-2 pb-4" aria-label="Mobile navigation">
              <ul className="space-y-2 m-0 p-0 list-none">
                <li>
                  <Link
                    href={inboxPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === inboxPath || pathname.startsWith(`${inboxPath}/`)
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Inbox
                  </Link>
                </li>
                <li>
                  <Link
                    href={sentPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === sentPath || pathname.startsWith(`${sentPath}/`)
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Sent
                  </Link>
                </li>
                <li>
                  <Link
                    href={composePath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === composePath
                        ? "bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Compose
                  </Link>
                </li>
              </ul>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2 space-y-2">
                <div className="flex items-center gap-3 px-4">
                  <SyncStatusIndicator />
                </div>
                <div className="flex items-center gap-3 px-4">
                  <AssistantToggle />
                </div>
              </div>
            </nav>
          </section>
        </header>
      </nav>
    </>
  );
}
