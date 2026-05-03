"use client";

import { cn } from "@/lib/utils";
import { MailNavbar } from "./navbar";
import { useAssistantStore } from "@/lib/store/assistant-store";

interface MailLayoutProps {
  children?: React.ReactNode;
}

function MailLayoutContent({ children }: MailLayoutProps) {
  const { isOpen } = useAssistantStore();

  return (
    <>
      <MailNavbar />
      <div className="app-shell app-grid-bg min-h-[100dvh] bg-[var(--app-bg)] relative overflow-hidden transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="app-grain" aria-hidden="true" />
        <main
          className={cn(
            "relative pt-20 sm:pt-24 px-4 sm:px-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen && "md:translate-x-[-200px]"
          )}
        >
          <div
            className={cn(
              "max-w-7xl mx-auto w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isOpen && "md:max-w-[calc(100%-200px)]"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export function MailLayout({ children }: MailLayoutProps = {}) {
  return <MailLayoutContent>{children}</MailLayoutContent>;
}
