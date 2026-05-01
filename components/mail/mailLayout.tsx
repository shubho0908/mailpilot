"use client";

import { useState } from "react";
import { Inbox } from "./inbox";
import { Compose } from "./compose";
import { Button } from "@/components/ui/button";

type View = "inbox" | "sent" | "compose";

export function MailLayout() {
  const [currentView, setCurrentView] = useState<View>("inbox");

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <svg
                  className="h-6 w-6 text-white"
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
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">MailPilot</h1>
            </div>
            <nav className="flex gap-1">
              <Button
                variant={currentView === "inbox" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("inbox")}
                className="h-9 px-4"
              >
                Inbox
              </Button>
              <Button
                variant={currentView === "sent" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("sent")}
                className="h-9 px-4"
              >
                Sent
              </Button>
              <Button
                variant={currentView === "compose" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("compose")}
                className="h-9 px-4"
              >
                Compose
              </Button>
            </nav>
          </div>
          <Button onClick={() => setCurrentView("compose")} size="sm" className="h-9 px-4">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Email
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {currentView === "inbox" && <Inbox />}
        {currentView === "sent" && <Inbox sent />}
        {currentView === "compose" && <Compose onClose={() => setCurrentView("inbox")} />}
      </main>
    </div>
  );
}
