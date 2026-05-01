"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEmail } from "@/hooks/queries/use-email";
import { useMailStore } from "@/lib/store/mail-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmailDetailProps {
  emailId: string;
  onBack: () => void;
}

export function EmailDetail({ emailId, onBack }: EmailDetailProps) {
  const router = useRouter();
  const { data: email, isLoading, error, refetch } = useEmail(emailId);
  const { setComposeState } = useMailStore();

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleReply = useCallback(() => {
    if (!email) return;
    const to = email.from.email;
    const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
    const body = `\n\n--- Original Message ---\nFrom: ${email.from.name || email.from.email}\nDate: ${new Date(email.date).toLocaleString()}\nTo: ${email.to.map((r) => r.email).join(", ")}\nSubject: ${email.subject}\n\n${email.body || email.htmlBody?.replace(/<[^>]*>/g, "") || ""}`;
    setComposeState({
      initialTo: to,
      initialSubject: subject,
      initialBody: body,
      mode: "reply",
      threadId: email.threadId,
      inReplyTo: email.id,
      references: [email.id],
    });
    router.push("/compose");
  }, [email, setComposeState, router]);

  const handleForward = useCallback(() => {
    if (!email) return;
    const subject = email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`;
    const body = `\n\n--- Forwarded Message ---\nFrom: ${email.from.name || email.from.email}\nDate: ${new Date(email.date).toLocaleString()}\nTo: ${email.to.map((r) => r.email).join(", ")}\nSubject: ${email.subject}\n\n${email.body || email.htmlBody?.replace(/<[^>]*>/g, "") || ""}`;
    setComposeState({
      initialSubject: subject,
      initialBody: body,
      mode: "forward",
    });
    router.push("/compose");
  }, [email, setComposeState, router]);

  if (isLoading) {
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
          <Skeleton className="h-7 sm:h-8 w-24 sm:w-32 mb-3 sm:mb-4" />
          <Skeleton className="h-3 sm:h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-1/2" />
          <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)] mt-4 sm:mt-6">
            <div className="bg-white dark:bg-zinc-900/80 rounded-lg p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-3 sm:h-4 w-32 sm:w-48" />
                  <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32" />
                </div>
                <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24 flex-shrink-0" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-5/6" />
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 sm:mb-6 rounded-full px-4 sm:px-6 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            ← Back
          </Button>
          <div className="text-center py-16 sm:py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-4 sm:mb-6">
              <svg
                className="h-8 w-8 sm:h-10 sm:w-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              Something went wrong
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 px-4">
              {error?.message || "Failed to fetch email"}
            </p>
            <Button onClick={handleRetry} className="rounded-full px-4 sm:px-8 text-xs sm:text-sm">
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 sm:mb-6 rounded-full px-4 sm:px-6 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            ← Back
          </Button>
          <div className="text-center py-16 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-medium text-zinc-900 dark:text-zinc-50">
              Email not found
            </h2>
          </div>
        </div>
      </div>
    );
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
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50 max-w-4xl">
                  {email.subject}
                </h1>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5">
                    <div className="w-full h-full rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {(email.from.name || email.from.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <h2 className="text-sm sm:text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                      {email.from.name || email.from.email}
                    </h2>
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 break-all">
                      &lt;{email.from.email}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 sm:mb-3 tracking-tight">
                    {new Date(email.date).toLocaleString()}
                  </p>

                  {email.to.length > 0 && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium tracking-tight">To:</span>{" "}
                      {email.to.map((recipient: { email: string }) => recipient.email).join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col gap-2">
                  <Button
                    onClick={handleReply}
                    className="rounded-lg px-3 sm:px-5 h-9 sm:h-10 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
                  >
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleForward}
                    className="rounded-lg px-3 sm:px-5 h-9 sm:h-10 transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
                  >
                    Forward
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                {email.unread && (
                  <Badge className="rounded-full px-2 sm:px-3 py-1 bg-emerald-500 text-white text-xs font-medium">
                    Unread
                  </Badge>
                )}
                {email.starred && (
                  <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 text-xs">
                    Starred
                  </Badge>
                )}
                {email.attachments.length > 0 && (
                  <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 text-xs">
                    {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            <ScrollArea className="h-[350px] sm:h-[400px]">
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-headings:tracking-tight">
                {email.htmlBody ? (
                  <div
                    className="email-body text-zinc-700 dark:text-zinc-300 prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 leading-relaxed text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                    style={{
                      color: "inherit",
                    }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm">
                    {email.body}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
