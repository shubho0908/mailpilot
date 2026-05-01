"use client";

import { cn } from "@/lib/utils";
import { MailNavbar } from "./navbar";
import { useAssistantStore } from "@/lib/store/assistant-store";

interface MailLayoutProps {
  children?: React.ReactNode;
}

function MailLayoutContent({ children }: MailLayoutProps = {}) {
  const { isOpen } = useAssistantStore();

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <MailNavbar />

      <main
        className={cn(
          "pt-24 sm:pt-28 px-3 sm:px-4 transition-transform duration-300 ease-out",
          isOpen && "translate-x-[-200px]"
        )}
      >
        <div
          className={cn(
            "max-w-7xl mx-auto w-full transition-all duration-300 ease-out",
            isOpen && "max-w-[calc(100%-200px)]"
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export function MailLayout({ children }: MailLayoutProps = {}) {
  return <MailLayoutContent>{children}</MailLayoutContent>;
}
