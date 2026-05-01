"use client";

import { useCallback } from "react";
import { useEmail } from "@/hooks/queries/use-email";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface EmailDetailProps {
  emailId: string;
  onBack: () => void;
}

export function EmailDetail({ emailId, onBack }: EmailDetailProps) {
  const { data: email, isLoading, error, refetch } = useEmail(emailId);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <ScrollArea className="flex-1 h-0">
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← Back to Inbox
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-red-50 p-6 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error?.message || "Failed to fetch email"}</p>
            </div>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← Back to Inbox
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-zinc-600 dark:text-zinc-400">Email not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Button onClick={onBack} variant="ghost" size="sm" className="mb-4">
          ← Back to Inbox
        </Button>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{email.subject}</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
            {(email.from.name || email.from.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {email.from.name || email.from.email}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              &lt;{email.from.email}&gt;
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
            {new Date(email.date).toLocaleString()}
          </div>
        </div>
        {email.to.length > 0 && (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">To:</span>{" "}
            {email.to.map((recipient: { email: string }) => recipient.email).join(", ")}
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="px-8 py-6">
          {email.htmlBody ? (
            <div
              className="prose max-w-none text-zinc-900 dark:text-zinc-50 prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:text-zinc-900 dark:prose-p:text-zinc-50 prose-a:text-blue-600 dark:prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-50">{email.body}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
