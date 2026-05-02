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
    <>
      <MailNavbar />
      <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
        <main
          className={cn(
            "pt-16 sm:pt-20 px-3 sm:px-4 transition-transform duration-300 ease-out",
            isOpen && "md:translate-x-[-200px]"
          )}
        >
          <div
            className={cn(
              "max-w-7xl mx-auto w-full transition-all duration-300 ease-out",
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
