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
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-[var(--app-bg)]/45 p-3 sm:p-4"
        ref={scrollRef}
      >
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
          "fixed inset-0 z-40 bg-[#191713]/28 backdrop-blur-[3px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:bg-zinc-950/58 md:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "app-shell fixed inset-x-2 bottom-2 z-50 flex h-[min(88dvh,720px)] max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[1.35rem] md:hidden",
          "border border-[var(--app-border)] bg-[var(--app-panel)] shadow-[0_-24px_64px_-34px_var(--app-shadow-strong),0_-8px_22px_-18px_var(--app-shadow)]",
          "ring-1 ring-[var(--app-border)]/60 backdrop-blur-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          isOpen ? "translate-y-0" : "translate-y-[calc(100%+1rem)]",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="AI Assistant"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[var(--app-border-strong)]" />
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
        "app-shell fixed inset-y-0 left-auto right-0 z-50 hidden h-full w-[400px] max-w-[calc(100vw-2rem)] flex-col md:flex",
        "border-l border-[var(--app-border)]",
        "bg-[var(--app-panel)] shadow-[0_4px_16px_-2px_var(--app-shadow)] backdrop-blur-md",
        "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
