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
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 sm:mb-6 rounded-lg px-3 sm:px-5 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
        >
          ← Back
        </Button>

        <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]">
          <div className="bg-white dark:bg-zinc-900/80 rounded-lg p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <EmailHeader
              email={email}
              threadMessages={threadMessages}
              onReply={handleReply}
              onForward={handleForward}
              onDelete={handleDelete}
            />

            <div className="min-h-[200px] max-h-[600px] overflow-y-auto pr-2">
              <div className="space-y-3">
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
