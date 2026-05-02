"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailDetailLoadingProps {
  onBack: () => void;
}

export function EmailDetailLoading({ onBack }: EmailDetailLoadingProps) {
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

interface EmailDetailErrorProps {
  onBack: () => void;
  onRetry: () => void;
  error?: Error;
}

export function EmailDetailError({ onBack, onRetry, error }: EmailDetailErrorProps) {
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
          <Button onClick={onRetry} className="rounded-full px-4 sm:px-8 text-xs sm:text-sm">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EmailDetailEmptyProps {
  onBack: () => void;
}

export function EmailDetailEmpty({ onBack }: EmailDetailEmptyProps) {
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
