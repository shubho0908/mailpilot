"use client";

import { useReducer, useCallback } from "react";
import { useSendEmail } from "@/hooks/mutations/use-send-email";
import { useMailStore } from "@/lib/store/mail-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ComposeState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  showCcBcc: boolean;
}

type ComposeAction =
  | { type: "SET_TO"; value: string }
  | { type: "SET_CC"; value: string }
  | { type: "SET_BCC"; value: string }
  | { type: "SET_SUBJECT"; value: string }
  | { type: "SET_BODY"; value: string }
  | { type: "TOGGLE_CC_BCC" }
  | { type: "RESET" };

function composeReducer(state: ComposeState, action: ComposeAction): ComposeState {
  switch (action.type) {
    case "SET_TO":
      return { ...state, to: action.value };
    case "SET_CC":
      return { ...state, cc: action.value };
    case "SET_BCC":
      return { ...state, bcc: action.value };
    case "SET_SUBJECT":
      return { ...state, subject: action.value };
    case "SET_BODY":
      return { ...state, body: action.value };
    case "TOGGLE_CC_BCC":
      return { ...state, showCcBcc: !state.showCcBcc };
    case "RESET":
      return { ...state, to: "", cc: "", bcc: "", subject: "", body: "" };
    default:
      return state;
  }
}

function ComposeHeader({ mode, onCancel }: { mode: string; onCancel: () => void }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50">
          {mode === "forward" ? "Forward" : mode === "reply" ? "Reply" : "Compose"}
        </h1>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="rounded-lg px-3 sm:px-5 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function Compose({ onClose }: { onClose: () => void }) {
  const composeState = useMailStore((state) => state.composeState);
  const setComposeState = useMailStore((state) => state.setComposeState);

  const mode = composeState?.mode || "compose";
  const threadId = composeState?.threadId;
  const inReplyTo = composeState?.inReplyTo;
  const references = composeState?.references;

  const [state, dispatch] = useReducer(composeReducer, {
    to: composeState?.initialTo || "",
    cc: composeState?.initialCc || "",
    bcc: composeState?.initialBcc || "",
    subject: composeState?.initialSubject || "",
    body: composeState?.initialBody || "",
    showCcBcc: Boolean(composeState?.initialCc || composeState?.initialBcc),
  });

  const { to, cc, bcc, subject, body, showCcBcc } = state;

  const { mutate: sendEmail, isPending, isSuccess } = useSendEmail();

  const updateComposeDraft = useCallback(
    (updates: {
      initialTo?: string;
      initialCc?: string;
      initialBcc?: string;
      initialSubject?: string;
      initialBody?: string;
    }) => {
      setComposeState({
        ...(composeState || { mode }),
        initialTo: to,
        initialCc: cc,
        initialBcc: bcc,
        initialSubject: subject,
        initialBody: body,
        ...updates,
      });
    },
    [bcc, body, cc, composeState, mode, setComposeState, subject, to]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendEmail(
        {
          to,
          subject,
          body,
          cc: cc || undefined,
          bcc: bcc || undefined,
          threadId,
          inReplyTo,
          references,
        },
        {
          onSuccess: () => {
            dispatch({ type: "RESET" });
            setComposeState(null);
            onClose();
          },
        }
      );
    },
    [
      sendEmail,
      to,
      subject,
      body,
      cc,
      bcc,
      threadId,
      inReplyTo,
      references,
      onClose,
      setComposeState,
    ]
  );

  const handleCancel = useCallback(() => {
    setComposeState(null);
    onClose();
  }, [setComposeState, onClose]);

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-0">
        <ComposeHeader mode={mode} onCancel={handleCancel} />

        <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="to"
                  className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  To
                </Label>
                <Input
                  id="to"
                  type="email"
                  value={to}
                  onChange={(e) => {
                    dispatch({ type: "SET_TO", value: e.target.value });
                    updateComposeDraft({ initialTo: e.target.value });
                  }}
                  required
                  placeholder="recipient@example.com"
                  disabled={isPending || isSuccess}
                  className="h-9 sm:h-10 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "TOGGLE_CC_BCC" })}
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs text-zinc-500 dark:text-zinc-400 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {showCcBcc ? "Hide" : "Show"} Cc & Bcc
              </Button>

              {showCcBcc && (
                <>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="cc"
                      className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
                    >
                      Cc
                    </Label>
                    <Input
                      id="cc"
                      type="email"
                      value={cc}
                      onChange={(e) => {
                        dispatch({ type: "SET_CC", value: e.target.value });
                        updateComposeDraft({ initialCc: e.target.value });
                      }}
                      placeholder="cc@example.com"
                      disabled={isPending || isSuccess}
                      className="h-9 sm:h-10 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="bcc"
                      className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
                    >
                      Bcc
                    </Label>
                    <Input
                      id="bcc"
                      type="email"
                      value={bcc}
                      onChange={(e) => {
                        dispatch({ type: "SET_BCC", value: e.target.value });
                        updateComposeDraft({ initialBcc: e.target.value });
                      }}
                      placeholder="bcc@example.com"
                      disabled={isPending || isSuccess}
                      className="h-9 sm:h-10 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    dispatch({ type: "SET_SUBJECT", value: e.target.value });
                    updateComposeDraft({ initialSubject: e.target.value });
                  }}
                  required
                  placeholder="Enter subject..."
                  disabled={isPending || isSuccess}
                  className="h-9 sm:h-10 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="body"
                  className="text-xs sm:text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  Message
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => {
                    dispatch({ type: "SET_BODY", value: e.target.value });
                    updateComposeDraft({ initialBody: e.target.value });
                  }}
                  required
                  rows={8}
                  placeholder="Write your message here..."
                  disabled={isPending || isSuccess}
                  className="min-h-[200px] sm:min-h-[240px] resize-y rounded-lg border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isPending || isSuccess}
                  className="flex-1 h-9 sm:h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs sm:text-sm"
                >
                  {isPending ? "Sending..." : "Send"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-9 sm:h-10 rounded-lg text-xs sm:text-sm px-3 sm:px-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
