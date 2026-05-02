"use client";

import { useState, useCallback, useEffect } from "react";
import { useSendEmail } from "@/hooks/mutations/use-send-email";
import { useMailStore } from "@/lib/store/mail-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Compose({ onClose }: { onClose: () => void }) {
  const composeState = useMailStore((state) => state.composeState);
  const setComposeState = useMailStore((state) => state.setComposeState);

  const [to, setTo] = useState(composeState?.initialTo || "");
  const [cc, setCc] = useState(composeState?.initialCc || "");
  const [bcc, setBcc] = useState(composeState?.initialBcc || "");
  const [subject, setSubject] = useState(composeState?.initialSubject || "");
  const [body, setBody] = useState(composeState?.initialBody || "");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const mode = composeState?.mode || "compose";
  const threadId = composeState?.threadId;
  const inReplyTo = composeState?.inReplyTo;
  const references = composeState?.references;

  const { mutate: sendEmail, isPending, error, isSuccess } = useSendEmail();

  useEffect(() => {
    if (composeState) {
      setTo(composeState.initialTo || "");
      setCc(composeState.initialCc || "");
      setBcc(composeState.initialBcc || "");
      setSubject(composeState.initialSubject || "");
      setBody(composeState.initialBody || "");
      setShowCcBcc(Boolean(composeState.initialCc || composeState.initialBcc));
    }
  }, [composeState]);

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
            setTo("");
            setCc("");
            setBcc("");
            setSubject("");
            setBody("");
            setComposeState(null);
            setTimeout(() => {
              onClose();
            }, 1500);
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
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50">
              {mode === "forward" ? "Forward" : mode === "reply" ? "Reply" : "Compose"}
            </h1>
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="rounded-lg px-3 sm:px-5 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            {isSuccess && (
              <div className="mb-4 sm:mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-xs sm:text-sm tracking-tight">
                      Email sent successfully
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                      Your message has been delivered
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-red-900 dark:text-red-100 text-xs sm:text-sm tracking-tight">
                      Failed to send email
                    </p>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 break-words">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    setTo(e.target.value);
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
                onClick={() => setShowCcBcc(!showCcBcc)}
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
                        setCc(e.target.value);
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
                        setBcc(e.target.value);
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
                    setSubject(e.target.value);
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
                    setBody(e.target.value);
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
