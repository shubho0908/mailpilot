"use client";

import { useAssistantStore } from "@/lib/store/assistant-store";
import { useAssistantPanel } from "./assistant/use-assistant-panel";
import {
  AssistantPanelContent,
  AssistantPanelMobile,
  AssistantPanelDesktop,
} from "./assistant/assistantPanelContent";

interface AssistantPanelProps {
  className?: string;
}

export function AssistantPanel({ className }: AssistantPanelProps = {}) {
  const { isOpen, closePanel } = useAssistantStore();
  const {
    messages,
    input,
    isThinking,
    error,
    pendingApproval,
    scrollRef,
    isSending,
    onSendMessage,
    onApproveSend,
    onRejectSend,
    onClearConversation,
    onKeyDown,
    onInputChange,
  } = useAssistantPanel();

  const panelContent = (
    <AssistantPanelContent
      closePanel={closePanel}
      isThinking={isThinking}
      messages={messages}
      error={error}
      pendingApproval={pendingApproval}
      scrollRef={scrollRef}
      onApproveSend={onApproveSend}
      onRejectSend={onRejectSend}
      input={input}
      onKeyDown={onKeyDown}
      onSendMessage={onSendMessage}
      onInputChange={onInputChange}
      onClearConversation={onClearConversation}
      isSending={isSending}
    />
  );

  return (
    <>
      <AssistantPanelMobile isOpen={isOpen} closePanel={closePanel} className={className}>
        {panelContent}
      </AssistantPanelMobile>
      <AssistantPanelDesktop isOpen={isOpen} className={className}>
        {panelContent}
      </AssistantPanelDesktop>
    </>
  );
}
