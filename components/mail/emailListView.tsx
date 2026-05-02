"use client";

import { useCallback, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmails } from "@/hooks/queries/use-emails";
import type { Email } from "@/services/gmail/gmail.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useMailStore } from "@/lib/store/mail-store";
import { useDebounce } from "@/hooks/use-debounce";
import type { Label } from "@/lib/validations";
import {
  mailFilterHref,
  mailFiltersEqual,
  mailFiltersFromSearchParams,
} from "@/lib/mail/filter-url";
import { normalizeInclusiveDateRange } from "@/lib/mail/date-range";
import { mailLabelSchema, mailViewByLabel } from "@/lib/mail/types";
import { EmailListViewHeader } from "./emailListView/emailListViewHeader";
import { EmailListViewFilter } from "./emailListView/emailListViewFilter";

interface EmailListViewProps {
  label: Label;
  title: string;
  listItemComponent: React.ComponentType<{
    email: Email;
    onClick: (id: string) => void;
    index: number;
  }>;
  showRecipientFilter?: boolean;
}

function EmailListViewContent({
  label,
  title,
  listItemComponent: ListItemComponent,
  showRecipientFilter = false,
}: EmailListViewProps) {
  const router = useRouter();
  const { push, replace } = router;
  const searchParams = useSearchParams();
  const { get } = searchParams;
  const pageToken = get.call(searchParams, "pageToken") || undefined;
  const view = mailViewByLabel[label];

  const storedFilters = useMailStore((state) => state.filters);
  const setFilters = useMailStore((state) => state.setFilters);
  const filters = useMemo(() => mailFiltersFromSearchParams(searchParams), [searchParams]);

  useEffect(() => {
    if (!mailFiltersEqual(storedFilters, filters)) {
      setFilters(filters);
    }
  }, [filters, setFilters, storedFilters]);

  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedSender = useDebounce(filters.sender, 300);

  const searchQuery = useMemo(() => {
    const parts: string[] = [];
    if (debouncedSearch) {
      parts.push(debouncedSearch);
    }
    return parts.join(" ");
  }, [debouncedSearch]);
  const gmailDateRange = useMemo(
    () =>
      normalizeInclusiveDateRange({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    [filters.dateFrom, filters.dateTo]
  );

  const { data, isLoading, error, refetch } = useEmails({
    label,
    pageToken,
    query: searchQuery || undefined,
    from: showRecipientFilter ? undefined : debouncedSender || undefined,
    to: showRecipientFilter ? debouncedSender || undefined : undefined,
    after: gmailDateRange.after,
    before: gmailDateRange.before,
    unread: filters.unread ?? undefined,
    maxResults: filters.maxResults || undefined,
  });

  const emails = useMemo(() => data?.emails || [], [data?.emails]);
  const hasNextPage = !!data?.nextPageToken;

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sender ||
    filters.unread !== null ||
    filters.maxResults;
  const isSentLabel = label === mailLabelSchema.enum.SENT;

  const handleEmailClick = useCallback(
    (id: string) => {
      push(`/${label.toLowerCase()}/${id}`);
    },
    [push, label]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback(
    (direction: "next" | "prev") => {
      const params = new URLSearchParams(searchParams.toString());
      if (direction === "next" && data?.nextPageToken) {
        params.set("pageToken", data.nextPageToken);
      } else if (direction === "prev") {
        params.delete("pageToken");
      }
      push(`?${params.toString()}`, { scroll: false });
    },
    [push, searchParams, data]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      replace(mailFilterHref(view, { ...filters, ...newFilters }), { scroll: false });
    },
    [filters, replace, view]
  );

  const handleClearFilters = useCallback(() => {
    push(`/${view}`, { scroll: false });
  }, [push, view]);

  const senderOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: "", label: showRecipientFilter ? "All recipients" : "All senders" },
    ];

    const emailSet = new Set(
      showRecipientFilter
        ? emails.flatMap((email: Email) => email.to.map((recipient) => recipient.email))
        : emails.map((email: Email) => email.from.email)
    );
    emailSet.add(filters.sender || "");

    for (const email of emailSet) {
      if (!email) continue;

      const [local, domain = ""] = email.split("@");
      const domainWithoutTld = domain.split(".")[0] || domain;

      if (local.length > 8 || domainWithoutTld.length > 8) {
        const truncatedLocal = local.length > 8 ? `${local.slice(0, 8)}...` : local;
        const truncatedDomain =
          domainWithoutTld.length > 8 ? `${domainWithoutTld.slice(0, 8)}...` : domainWithoutTld;
        options.push({
          value: email,
          label: `${truncatedLocal}@${truncatedDomain}`,
        });
      } else {
        options.push({ value: email, label: email });
      }
    }

    return options;
  }, [emails, filters.sender, showRecipientFilter]);

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        <EmailListViewHeader
          title={title}
          emailsCount={emails.length}
          resultSizeEstimate={data?.resultSizeEstimate}
          hasActiveFilters={hasActiveFilters === true}
          isLoading={isLoading}
          onClearFilters={handleClearFilters}
        />
        <EmailListViewFilter
          filters={filters}
          senderOptions={senderOptions}
          showRecipientFilter={showRecipientFilter}
          onFilterChange={handleFilterChange}
        />

        {isLoading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`skeleton-${label}-item-${i}`}
                className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]"
              >
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-24 sm:w-32" />
                      <Skeleton className="h-3 w-20 sm:w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4 sm:w-3/4" />
                    </div>
                    <Skeleton className="h-3 w-10 sm:w-12 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
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
              {error.message || "Failed to fetch emails"}
            </p>
            <Button onClick={handleRetry} className="rounded-full px-6 sm:px-8">
              Try again
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4 sm:mb-6">
              <svg
                className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-medium text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3">
              {hasActiveFilters
                ? "No emails match your filters"
                : isSentLabel
                  ? "No sent emails"
                  : "No emails found"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mb-6">
              {hasActiveFilters
                ? "Try adjusting your search criteria or clear the filters to see more emails."
                : isSentLabel
                  ? "Your sent folder is empty. Emails you send will appear here."
                  : "Your inbox is empty. New emails will appear here when they arrive."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full px-6"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {emails.map((email: Email, index: number) => (
                <ListItemComponent
                  key={email.id}
                  email={email}
                  onClick={handleEmailClick}
                  index={index}
                />
              ))}
            </div>
            {hasNextPage && (
              <Pagination
                hasNextPage={hasNextPage}
                hasPrevPage={!!pageToken}
                onNext={() => handlePageChange("next")}
                onPrev={() => handlePageChange("prev")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmailListViewSkeleton() {
  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-fallback-item-${i}`}
              className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-0.5 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-24 sm:w-32" />
                    <Skeleton className="h-3 w-20 sm:w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 sm:w-3/4" />
                  </div>
                  <Skeleton className="h-3 w-10 sm:w-12 flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmailListView(props: EmailListViewProps) {
  return (
    <Suspense fallback={<EmailListViewSkeleton />}>
      <EmailListViewContent {...props} />
    </Suspense>
  );
}
