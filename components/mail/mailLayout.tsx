"use client";

import { MailNavbar } from "./mail-navbar";

interface MailLayoutProps {
  children?: React.ReactNode;
}

export function MailLayout({ children }: MailLayoutProps = {}) {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <MailNavbar />

      <main className="pt-20 sm:pt-24 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
