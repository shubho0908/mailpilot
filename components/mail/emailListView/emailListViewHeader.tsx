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
    <div className="mb-8 sm:mb-10">
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="app-heading mb-2 sm:mb-3">{title}</h1>
          <p className="app-body leading-relaxed max-w-md">
            {isLoading
              ? "Loading your emails..."
              : `${emailsCount} email${emailsCount !== 1 ? "s" : ""}${hasActiveFilters && resultSizeEstimate ? ` (filtered from ${resultSizeEstimate})` : ""}`}
          </p>
        </div>
        {hasActiveFilters && !isLoading && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            className="app-btn-secondary px-4 py-2 text-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
