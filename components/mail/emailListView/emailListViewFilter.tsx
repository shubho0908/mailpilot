import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datePicker";
import { mailFiltersFromSearchParams } from "@/lib/mail/filter-url";

interface EmailListViewFilterProps {
  filters: ReturnType<typeof mailFiltersFromSearchParams>;
  senderOptions: { value: string; label: string }[];
  showRecipientFilter: boolean;
  onFilterChange: (filters: Partial<ReturnType<typeof mailFiltersFromSearchParams>>) => void;
}

export function EmailListViewFilter({
  filters,
  senderOptions,
  showRecipientFilter,
  onFilterChange,
}: EmailListViewFilterProps) {
  return (
    <div className="mb-6 sm:mb-8 relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl p-1 ring-1 ring-black/[0.02] dark:ring-white/[0.05] shadow-[0_2px_8px_-1px_rgba(0,0,0,0.04),0_1px_4px_-1px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3),0_1px_4px_-1px_rgba(0,0,0,0.2)]">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 min-w-[200px] sm:min-w-[280px]">
            <Input
              type="text"
              placeholder="Search emails..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="h-9 sm:h-10 rounded-lg border-zinc-200 dark:border-zinc-800 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <DatePicker
              value={filters.dateFrom || ""}
              onChange={(value) => onFilterChange({ dateFrom: value || null })}
              placeholder="From"
              className="h-9 sm:h-10 w-full sm:w-40"
            />
            <DatePicker
              value={filters.dateTo || ""}
              onChange={(value) => onFilterChange({ dateTo: value || null })}
              placeholder="To"
              className="h-9 sm:h-10 w-full sm:w-40"
            />
            <Select
              value={filters.sender || ""}
              onValueChange={(value) => onFilterChange({ sender: value || null })}
            >
              <SelectTrigger className="h-9 sm:h-10 w-full sm:w-48">
                <SelectValue placeholder={showRecipientFilter ? "Filter by recipient" : "Sender"} />
              </SelectTrigger>
              <SelectContent>
                {senderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.unread === null ? "all" : filters.unread ? "unread" : "read"}
              onValueChange={(value) =>
                onFilterChange({
                  unread: value === "all" ? null : value === "unread",
                })
              }
            >
              <SelectTrigger className="h-9 sm:h-10 w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All mail</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
