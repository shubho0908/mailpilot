"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmails } from "@/hooks/queries/use-emails";
import type { Email } from "@/services/gmail/gmail.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Pagination } from "@/components/ui/pagination";
import { useMailStore } from "@/lib/store/mail-store";
import EmailListItem from "./sentEmailListItem";

export function SentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageToken = searchParams.get("pageToken") || undefined;

  const { data, isLoading, error, refetch } = useEmails({
    label: "SENT",
    pageToken,
  });

  const emails = data?.emails || [];
  const hasNextPage = !!data?.nextPageToken;

  const { filters, setFilters, clearFilters } = useMailStore();

  const hasActiveFilters = filters.search || filters.dateFrom || filters.dateTo || filters.sender;

  const filteredEmails = useMemo(() => {
    if (!hasActiveFilters) return emails;

    return emails.filter((email: Email) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          email.subject.toLowerCase().includes(searchLower) ||
          email.to.some(
            (recipient) =>
              recipient.email.toLowerCase().includes(searchLower) ||
              (recipient.name && recipient.name.toLowerCase().includes(searchLower))
          ) ||
          email.snippet.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.sender && !email.to.some((recipient) => recipient.email === filters.sender)) {
        return false;
      }

      if (filters.dateFrom) {
        const emailDate = new Date(email.date);
        const fromDate = new Date(filters.dateFrom);
        if (emailDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const emailDate = new Date(email.date);
        const toDate = new Date(filters.dateTo);
        if (emailDate > toDate) return false;
      }

      return true;
    });
  }, [emails, filters, hasActiveFilters]);

  const handleEmailClick = useCallback(
    (id: string) => {
      router.push(`/sent/${id}`);
    },
    [router]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const [scrollPosition, setScrollPosition] = useState(0);

  const senderOptions = useMemo(
    () => [
      { value: "", label: "All recipients" },
      ...Array.from(
        new Set(emails.flatMap((email: Email) => email.to.map((recipient) => recipient.email)))
      ).map((email) => {
        const [local, domain] = email.split("@");
        const domainWithoutTld = domain.split(".")[0];

        if (local.length > 8 || domainWithoutTld.length > 8) {
          const truncatedLocal = local.length > 8 ? `${local.slice(0, 8)}...` : local;
          const truncatedDomain =
            domainWithoutTld.length > 8 ? `${domainWithoutTld.slice(0, 8)}...` : domainWithoutTld;
          return {
            value: email,
            label: `${truncatedLocal}@${truncatedDomain}`,
          };
        }
        return { value: email, label: email };
      }),
    ],
    [emails]
  );

  const handlePageChange = useCallback(
    (direction: "next" | "prev") => {
      // Save scroll position before navigation
      setScrollPosition(window.scrollY);

      const params = new URLSearchParams(searchParams.toString());
      if (direction === "next" && data?.nextPageToken) {
        params.set("pageToken", data.nextPageToken);
      } else if (direction === "prev") {
        params.delete("pageToken");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, data]
  );

  // Restore scroll position after data loads
  useEffect(() => {
    if (scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
      setScrollPosition(0);
    }
  }, [data, scrollPosition]);

  if (isLoading && !data) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3">
              Sent
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your emails...</p>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
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

  if (error) {
    return (
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
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
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3">
                Sent
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""}
                {hasActiveFilters && ` (filtered from ${emails.length})`}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs sm:text-sm"
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Input
              placeholder="Search emails..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="flex-1 h-9 sm:h-10 text-sm"
            />
            <Select
              value={filters.sender || ""}
              onValueChange={(value) => setFilters({ sender: value || "" })}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Filter by recipient" />
              </SelectTrigger>
              <SelectContent>
                {senderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              value={filters.dateFrom || ""}
              onChange={(value) => setFilters({ dateFrom: value || null })}
              placeholder="From"
              className="h-9 sm:h-10 w-full sm:w-40"
            />
            <DatePicker
              value={filters.dateTo || ""}
              onChange={(value) => setFilters({ dateTo: value || null })}
              placeholder="To"
              className="h-9 sm:h-10 w-full sm:w-40"
            />
          </div>
        </div>

        {filteredEmails.length === 0 ? (
          <div className="py-12 sm:py-16 text-center px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3 sm:mb-4">
              <svg
                className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              {hasActiveFilters ? "No emails match your filters" : "No sent emails"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {hasActiveFilters ? "Try adjusting your filters" : "Your sent folder is empty"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredEmails.map((email: Email, index: number) => (
                <EmailListItem
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
