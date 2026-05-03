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
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="app-heading">
          {mode === "forward" ? "Forward" : mode === "reply" ? "Reply" : "Compose"}
        </h1>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="px-4 py-2 text-xs sm:text-sm app-btn-secondary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
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
    <div className="py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-2 sm:px-0">
        <ComposeHeader mode={mode} onCancel={handleCancel} />

        <div className="app-card p-1">
          <div className="bg-[var(--app-panel)] rounded-lg p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="to"
                  className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)]"
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
                  className="app-input h-10 sm:h-11 text-xs sm:text-sm"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => dispatch({ type: "TOGGLE_CC_BCC" })}
                className="h-9 sm:h-10 px-4 text-xs text-[var(--app-text-muted)] app-btn-secondary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
              >
                {showCcBcc ? "Hide" : "Show"} Cc & Bcc
              </Button>

              {showCcBcc && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cc"
                      className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)]"
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
                      className="app-input h-10 sm:h-11 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bcc"
                      className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)]"
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
                      className="app-input h-10 sm:h-11 text-xs sm:text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)]"
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
                  className="app-input h-10 sm:h-11 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="body"
                  className="text-xs sm:text-sm font-medium tracking-tight text-[var(--app-text)]"
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
                  className="app-input min-h-[200px] sm:min-h-[240px] resize-y text-xs sm:text-sm"
                />
              </div>

              <div className="flex gap-3 sm:gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={isPending || isSuccess}
                  className="app-btn-primary flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                >
                  {isPending ? "Sending..." : "Send"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-10 sm:h-11 text-xs sm:text-sm px-6 app-btn-secondary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
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
