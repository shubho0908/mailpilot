"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ hasNextPage, hasPrevPage, onNext, onPrev }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 sm:py-8">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrevPage}
        className="rounded-lg px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm"
      >
        <svg
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNextPage}
        className="rounded-lg px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm"
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <svg
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
