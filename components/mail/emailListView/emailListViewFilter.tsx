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
    <div className="mb-8 sm:mb-10 app-card p-1">
      <div className="bg-[var(--app-panel)] rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 lg:min-w-[280px]">
            <Input
              type="text"
              placeholder="Search emails..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="app-input h-10 sm:h-11 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:flex lg:flex-wrap">
            <DatePicker
              value={filters.dateFrom || ""}
              onChange={(value) => onFilterChange({ dateFrom: value || null })}
              placeholder="From"
              className="h-10 w-full sm:h-11 lg:w-40"
            />
            <DatePicker
              value={filters.dateTo || ""}
              onChange={(value) => onFilterChange({ dateTo: value || null })}
              placeholder="To"
              className="h-10 w-full sm:h-11 lg:w-40"
            />
            <Select
              value={filters.sender || ""}
              onValueChange={(value) => onFilterChange({ sender: value || null })}
            >
              <SelectTrigger className="app-input h-10 w-full sm:h-11 lg:w-48">
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
              <SelectTrigger className="app-input h-10 w-full sm:h-11 lg:w-36">
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
