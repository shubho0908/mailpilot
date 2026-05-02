"use client";

import { useState } from "react";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { ApiKeySetupModal } from "@/components/user/apiKeySetupModal";
import { useCurrentUser } from "@/hooks/queries/use-user-profile";

interface AssistantToggleProps {
  className?: string;
}

export function AssistantToggle({ className }: AssistantToggleProps = {}) {
  const { isOpen, togglePanel } = useAssistantStore();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { data: user, isLoading } = useCurrentUser();

  const handleToggleAssistant = () => {
    if (isLoading || !user) return;

    if (!user.hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    togglePanel();
  };

  return (
    <>
      <button
        onClick={handleToggleAssistant}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)] text-sm font-medium w-auto h-auto",
          "sm:flex sm:justify-center sm:w-8 sm:h-8 sm:px-0 sm:py-0 sm:gap-0",
          isOpen && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
          className
        )}
        aria-label="Toggle assistant panel"
        disabled={isLoading || !user}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sm:hidden">AI Assistant</span>
      </button>
      <ApiKeySetupModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onComplete={() => {
          setShowApiKeyModal(false);
        }}
      />
    </>
  );
}
