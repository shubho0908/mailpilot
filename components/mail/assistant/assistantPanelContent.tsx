import { cn } from "@/lib/utils";
import type { Message, PendingApproval } from "./assistantPanelMessagesList";
import { AssistantPanelHeader } from "./assistantPanelHeader";
import { AssistantPanelFooter } from "./assistantPanelFooter";
import { AssistantPanelMessagesList } from "./assistantPanelMessagesList";

interface AssistantPanelContentProps {
  closePanel: () => void;
  isThinking: boolean;
  messages: Message[];
  error: string | null;
  pendingApproval: PendingApproval | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onApproveSend: () => void;
  onRejectSend: () => void;
  input: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  onClearConversation: () => void;
  isSending: boolean;
}

export function AssistantPanelContent({
  closePanel,
  isThinking,
  messages,
  error,
  pendingApproval,
  scrollRef,
  onApproveSend,
  onRejectSend,
  input,
  onKeyDown,
  onSendMessage,
  onInputChange,
  onClearConversation,
  isSending,
}: AssistantPanelContentProps) {
  return (
    <>
      <AssistantPanelHeader onClose={closePanel} isThinking={isThinking} />
      <div className="min-h-0 flex-1 overflow-y-auto p-3" ref={scrollRef}>
        <AssistantPanelMessagesList
          messages={messages}
          error={error}
          pendingApproval={pendingApproval}
          isThinking={isThinking}
          onApproveSend={onApproveSend}
          onRejectSend={onRejectSend}
          isSending={isSending}
        />
      </div>
      <AssistantPanelFooter
        messages={messages}
        input={input}
        onKeyDown={onKeyDown}
        isThinking={isThinking}
        onSendMessage={onSendMessage}
        onInputChange={onInputChange}
        onClearConversation={onClearConversation}
      />
    </>
  );
}

interface AssistantPanelMobileProps {
  isOpen: boolean;
  closePanel: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AssistantPanelMobile({
  isOpen,
  closePanel,
  children,
  className,
}: AssistantPanelMobileProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close assistant panel"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closePanel}
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/35 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex h-[min(86dvh,760px)] w-full flex-col md:hidden",
          "rounded-t-[1.25rem] border border-zinc-200/70 border-b-0",
          "bg-white/95 shadow-[0_-12px_40px_-18px_rgba(0,0,0,0.35)] backdrop-blur-xl",
          "ring-1 ring-black/[0.02] transition-transform duration-300 ease-out",
          "dark:border-zinc-800/70 dark:bg-zinc-900/95 dark:ring-white/[0.05]",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="AI Assistant"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        {children}
      </div>
    </>
  );
}

interface AssistantPanelDesktopProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AssistantPanelDesktop({ isOpen, children, className }: AssistantPanelDesktopProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-auto right-0 z-50 hidden md:flex h-full w-[400px] max-w-[calc(100vw-2rem)] flex-col",
        "border-l border-zinc-200/70",
        "bg-white/95 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] backdrop-blur-xl",
        "ring-1 ring-black/[0.02] transition-transform duration-300 ease-out",
        "dark:border-zinc-800/70 dark:bg-zinc-900/95 dark:ring-white/[0.05]",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label="AI Assistant"
    >
      {children}
    </div>
  );
}
