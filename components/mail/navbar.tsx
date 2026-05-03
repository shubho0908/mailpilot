"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArrowLogo from "@/components/arrowLogo";
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
        className={`fixed inset-0 bg-[var(--app-text)]/10 backdrop-blur-sm z-30 sm:hidden transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <nav className="fixed top-0 left-1/2 z-40 w-full max-w-[calc(100vw-1rem)] -translate-x-1/2 px-2 sm:w-auto sm:max-w-none sm:px-6">
        <header className="app-shell flex flex-col bg-[var(--app-bg-translucent)] backdrop-blur-2xl rounded-2xl mt-3 sm:mt-4 border border-[var(--app-border)] shadow-[0_8px_32px_-4px_var(--app-shadow),0_4px_16px_-4px_var(--app-shadow),0_2px_8px_-2px_var(--app-shadow)] ring-1 ring-[var(--app-border)]/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center justify-between gap-1 px-3 py-2.5 sm:gap-2 sm:px-4">
            <div className="flex items-center gap-2.5 pr-3 border-[var(--app-border)]/60 flex-shrink-0 md:border-r md:pr-4">
              <ArrowLogo width={40} height={40} />
              <span className="text-sm font-semibold tracking-tight text-[var(--app-text)]">
                MailPilot
              </span>
            </div>

            <ul className="hidden sm:flex items-center gap-1 flex-1 justify-center m-0 p-0 list-none">
              <li>
                <Link
                  href={inboxPath}
                  className={`px-3 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer whitespace-nowrap sm:px-4 ${
                    pathname === inboxPath || pathname.startsWith(`${inboxPath}/`)
                      ? "bg-[var(--app-soft)] text-[var(--app-text)] shadow-[inset_0_1px_2px_var(--app-shadow)]"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-soft)] hover:text-[var(--app-text)]"
                  }`}
                >
                  Inbox
                </Link>
              </li>
              <li>
                <Link
                  href={sentPath}
                  className={`px-3 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer whitespace-nowrap sm:px-4 ${
                    pathname === sentPath
                      ? "bg-[var(--app-soft)] text-[var(--app-text)] shadow-[inset_0_1px_2px_var(--app-shadow)]"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-soft)] hover:text-[var(--app-text)]"
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
                  className="app-btn-primary flex items-center gap-2 px-4 py-2 text-sm cursor-pointer sm:px-5"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.7}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">New</span>
                </Link>
              </div>

              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--app-soft)] text-[var(--app-text-muted)] hover:bg-[var(--app-border-strong)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_1px_3px_-1px_var(--app-shadow)] active:scale-[0.98]"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.7} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.7} />
                )}
              </Button>

              <div className="sm:hidden">
                <UserProfileDropdown />
              </div>
            </div>
          </div>

          <section
            className={`sm:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
            aria-label="Mobile navigation menu"
          >
            <nav className="px-3 pb-4" aria-label="Mobile navigation">
              <ul className="space-y-2 m-0 p-0 list-none">
                <li>
                  <Link
                    href={inboxPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pathname === inboxPath || pathname.startsWith(`${inboxPath}/`)
                        ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                        : "text-[var(--app-text-muted)] hover:bg-[var(--app-soft)]"
                    }`}
                  >
                    Inbox
                  </Link>
                </li>
                <li>
                  <Link
                    href={sentPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pathname === sentPath || pathname.startsWith(`${sentPath}/`)
                        ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                        : "text-[var(--app-text-muted)] hover:bg-[var(--app-soft)]"
                    }`}
                  >
                    Sent
                  </Link>
                </li>
                <li>
                  <Link
                    href={composePath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      pathname === composePath
                        ? "app-btn-primary"
                        : "text-[var(--app-text-muted)] hover:bg-[var(--app-soft)]"
                    }`}
                  >
                    Compose
                  </Link>
                </li>
              </ul>
              <div className="border-t border-[var(--app-border)] pt-2 mt-2 space-y-2">
                <div className="flex items-center gap-3 px-4">
                  <SyncStatusIndicator />
                </div>
                <div className="flex items-center gap-3 px-4">
                  <AssistantToggle onPanelOpen={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            </nav>
          </section>
        </header>
      </nav>
    </>
  );
}
