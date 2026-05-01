"use client";

import { useState, useCallback, memo } from "react";
import { useEmails } from "@/hooks/queries/use-emails";
import type { Email } from "@/services/gmail/gmail.types";
import { EmailDetail } from "./emailDetail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InboxProps {
  sent?: boolean;
}

interface EmailListItemProps {
  email: Email;
  onClick: (id: string) => void;
}

const EmailListItem = memo(({ email, onClick }: EmailListItemProps) => {
  const handleClick = useCallback(() => {
    onClick(email.id);
  }, [email.id, onClick]);

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:pl-8"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
          {(email.from.name || email.from.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-semibold text-sm ${email.unread ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              {email.from.name || email.from.email}
            </span>
            <div className="flex items-center gap-2">
              {email.unread && (
                <Badge variant="default" className="h-2 w-2 rounded-full p-0 bg-blue-500" />
              )}
              <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                {new Date(email.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div
            className={`mt-1 text-sm ${email.unread ? "font-semibold text-zinc-800 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}
          >
            {email.subject}
          </div>
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-500 line-clamp-2">
            {email.snippet}
          </div>
        </div>
      </div>
    </div>
  );
});

EmailListItem.displayName = "EmailListItem";

export function Inbox({ sent = false }: InboxProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useEmails({
      label: sent ? "SENT" : "INBOX",
    });

  const emails = data?.pages.flatMap((page) => page.emails) || [];

  const handleEmailClick = useCallback((id: string) => {
    setSelectedEmailId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEmailId(null);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (selectedEmailId) {
    return <EmailDetail emailId={selectedEmailId} onBack={handleBack} />;
  }

  if (isLoading && !data) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {sent ? "Sent" : "Inbox"}
          </h2>
        </div>
        <ScrollArea className="flex-1 h-0">
          <div className="p-6 space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {sent ? "Sent" : "Inbox"}
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-red-50 p-6 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error.message || "Failed to fetch emails"}</p>
            </div>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {sent ? "Sent" : "Inbox"}
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{emails.length} emails</span>
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        {emails.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">No emails found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {emails.map((email: Email) => (
                <EmailListItem key={email.id} email={email} onClick={handleEmailClick} />
              ))}
            </div>
            {hasNextPage && (
              <div className="p-6">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="w-full"
                >
                  {isFetchingNextPage ? "Loading more..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
