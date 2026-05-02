"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEmailThread } from "@/hooks/queries/use-email-thread";
import { useMailStore } from "@/lib/store/mail-store";
import { useDeleteEmail } from "@/hooks/mutations/use-delete-email";
import { composeModeSchema, mailRouteSchema, pathForMailRoute } from "@/lib/mail/types";
import { plainTextFromEmail, replyHeadersForEmail } from "@/lib/mail/email-utils";
import { Button } from "@/components/ui/button";
import { EmailHeader } from "./emailHeader";
import { ThreadMessageCard } from "./threadMessageCard";
import { EmailDetailLoading, EmailDetailError, EmailDetailEmpty } from "./emailDetailStates";

interface EmailDetailProps {
  emailId: string;
  onBack: () => void;
}

export function EmailDetail({ emailId, onBack }: EmailDetailProps) {
  const router = useRouter();
  const { push } = router;
  const { data, isLoading, error, refetch } = useEmailThread(emailId);
  const { setComposeState } = useMailStore();
  const { mutate: deleteEmail } = useDeleteEmail();
  const email = data?.email;
  const threadMessages = data?.thread.messages.length ? data.thread.messages : email ? [email] : [];
  const replyTarget = threadMessages[threadMessages.length - 1] || email;

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleReply = useCallback(() => {
    if (!replyTarget) return;
    const to = replyTarget.from.email;
    const subject = replyTarget.subject.startsWith("Re:")
      ? replyTarget.subject
      : `Re: ${replyTarget.subject}`;
    const body = `\n\n--- Original Message ---\nFrom: ${replyTarget.from.name || replyTarget.from.email}\nDate: ${new Date(replyTarget.date).toLocaleString()}\nTo: ${replyTarget.to.map((r) => r.email).join(", ")}\nSubject: ${replyTarget.subject}\n\n${plainTextFromEmail(replyTarget)}`;
    const replyHeaders = replyHeadersForEmail(replyTarget);
    setComposeState({
      initialTo: to,
      initialSubject: subject,
      initialBody: body,
      mode: composeModeSchema.enum.reply,
      threadId: replyTarget.threadId,
      inReplyTo: replyHeaders.inReplyTo,
      references: replyHeaders.references,
    });
    push(pathForMailRoute(mailRouteSchema.enum.compose));
  }, [replyTarget, setComposeState, push]);

  const handleForward = useCallback(() => {
    if (!email) return;
    const subject = email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`;
    const body = `\n\n--- Forwarded Message ---\nFrom: ${email.from.name || email.from.email}\nDate: ${new Date(email.date).toLocaleString()}\nTo: ${email.to.map((r) => r.email).join(", ")}\nSubject: ${email.subject}\n\n${plainTextFromEmail(email)}`;
    setComposeState({
      initialSubject: subject,
      initialBody: body,
      mode: composeModeSchema.enum.forward,
    });
    push(pathForMailRoute(mailRouteSchema.enum.compose));
  }, [email, setComposeState, push]);

  const handleDelete = useCallback(() => {
    if (!email) return;
    deleteEmail(
      { id: email.id },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  }, [email, deleteEmail, onBack]);

  if (isLoading) {
    return <EmailDetailLoading onBack={onBack} />;
  }

  if (error) {
    return <EmailDetailError onBack={onBack} onRetry={handleRetry} error={error} />;
  }

  if (!email) {
    return <EmailDetailEmpty onBack={onBack} />;
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-0">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 ml-0 rounded-lg px-4 text-xs transition-all duration-300 hover:scale-105 active:scale-95 sm:mb-6 sm:ml-0 sm:px-5 sm:text-sm"
        >
          ← Back
        </Button>

        <div className="relative overflow-hidden rounded-2xl bg-white/95 p-0.5 shadow-[0_12px_40px_-28px_rgba(16,185,129,0.45),0_2px_10px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:bg-zinc-900/95 dark:shadow-[0_12px_40px_-28px_rgba(16,185,129,0.35),0_2px_10px_-4px_rgba(0,0,0,0.5)] dark:ring-white/[0.07] sm:rounded-xl">
          <div className="rounded-[calc(1rem-2px)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:bg-zinc-900/80 sm:rounded-lg sm:p-6">
            <EmailHeader
              email={email}
              threadMessages={threadMessages}
              onReply={handleReply}
              onForward={handleForward}
              onDelete={handleDelete}
            />

            <div className="min-h-[200px] overflow-x-hidden sm:max-h-[600px] sm:overflow-y-auto sm:pr-2">
              <div className="space-y-4 sm:space-y-3">
                {threadMessages.map((message) => (
                  <ThreadMessageCard
                    key={message.id}
                    email={message}
                    isCurrent={message.id === email.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
