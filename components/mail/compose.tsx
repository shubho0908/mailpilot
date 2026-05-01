"use client";

import { useState, useCallback } from "react";
import { useSendEmail } from "@/hooks/mutations/use-send-email";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface ComposeProps {
  onClose: () => void;
}

export function Compose({ onClose }: ComposeProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { mutate: sendEmail, isPending, error, isSuccess } = useSendEmail();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendEmail(
        { to, subject, body },
        {
          onSuccess: () => {
            setTo("");
            setSubject("");
            setBody("");
            setTimeout(() => {
              onClose();
            }, 1500);
          },
        }
      );
    },
    [sendEmail, to, subject, body, onClose]
  );

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Compose</h2>
          <Button onClick={handleCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="px-8 py-6">
          {isSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Email sent successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-medium">{error.message || "Failed to send email"}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm font-medium">
                To
              </Label>
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                placeholder="recipient@example.com"
                disabled={isPending || isSuccess}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Email subject"
                disabled={isPending || isSuccess}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium">
                Body
              </Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={12}
                placeholder="Write your message here..."
                disabled={isPending || isSuccess}
                className="min-h-[300px] resize-y"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isPending || isSuccess} className="h-11 px-8">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-11 px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
