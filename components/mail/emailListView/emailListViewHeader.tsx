import { Button } from "@/components/ui/button";

interface EmailListViewHeaderProps {
  title: string;
  emailsCount: number;
  resultSizeEstimate?: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
}

export function EmailListViewHeader({
  title,
  emailsCount,
  resultSizeEstimate,
  hasActiveFilters,
  isLoading,
  onClearFilters,
}: EmailListViewHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3">
            {title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
            {isLoading
              ? "Loading your emails..."
              : `${emailsCount} email${emailsCount !== 1 ? "s" : ""}${hasActiveFilters && resultSizeEstimate ? ` (filtered from ${resultSizeEstimate})` : ""}`}
          </p>
        </div>
        {hasActiveFilters && !isLoading && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="self-start">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
