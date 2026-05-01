"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssistantStore } from "@/lib/store/assistant-store";
import { MessageSquare, X, Send, Trash2, Loader2, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AssistantToggleProps {
  className?: string;
}

export function AssistantToggle({ className }: AssistantToggleProps = {}) {
  const { isOpen, togglePanel } = useAssistantStore();

  return (
    <button
      onClick={togglePanel}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]",
        isOpen && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        className
      )}
      aria-label="Toggle assistant panel"
    >
      <MessageSquare className="h-4 w-4" />
    </button>
  );
}

interface AssistantPanelProps {
  className?: string;
}

export function AssistantPanel({ className }: AssistantPanelProps = {}) {
  const { isOpen, closePanel } = useAssistantStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand. I'll help you with that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1500);
  };

  const handleClearConversation = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 h-full flex flex-col",
        "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl",
        "shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)]",
        "ring-1 ring-black/[0.02] dark:ring-white/[0.05]",
        "transition-transform duration-300 ease-out",
        "border-l border-zinc-200/50 dark:border-zinc-800/50",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
      style={{ width: "400px", maxWidth: "calc(100vw - 2rem)" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.15)]">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">AI Assistant</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isTyping ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={closePanel}
            variant="ghost"
            size="icon-xs"
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        className="overflow-y-auto p-3"
        ref={scrollRef}
        style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="space-y-4">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3">
                <MessageSquare className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">No messages yet</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Ask me anything about your emails
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2.5",
                  message.role === "user"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    message.role === "user" ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 h-9 text-sm"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {messages.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={handleClearConversation}
              variant="ghost"
              size="xs"
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
