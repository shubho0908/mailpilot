"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar w-fit max-w-full bg-background p-2 text-foreground [--cell-radius:var(--radius-md)] [--cell-size:2rem] sm:[--cell-size:2.125rem] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("relative w-fit", defaultClassNames.root),
        months: cn("relative flex w-fit flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-fit flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-[var(--cell-size)] p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-[var(--cell-size)] p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[var(--cell-size)] w-full items-center justify-center px-[var(--cell-size)]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[var(--cell-size)] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn("relative rounded-[var(--cell-radius)]", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-[var(--cell-radius)] text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn(
          "w-full table-fixed border-collapse border-spacing-0",
          defaultClassNames.month_grid
        ),
        weekdays: cn("table-row", defaultClassNames.weekdays),
        weekday: cn(
          "h-[var(--cell-size)] w-[var(--cell-size)] pb-1 text-center align-middle text-[0.75rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn("table-row", defaultClassNames.week),
        week_number_header: cn(
          "w-[var(--cell-size)] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "h-[var(--cell-size)] w-[var(--cell-size)] text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative h-[var(--cell-size)] w-[var(--cell-size)] p-0 text-center align-middle select-none [&:last-child[data-selected=true]_button]:rounded-r-[var(--cell-radius)]",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-[var(--cell-radius)]"
            : "[&:first-child[data-selected=true]_button]:rounded-l-[var(--cell-radius)]",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: buttonVariant }),
          "mx-auto flex size-[var(--cell-size)] items-center justify-center rounded-[var(--cell-radius)] border border-transparent p-0 text-sm font-normal tabular-nums transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          defaultClassNames.day_button
        ),
        selected: cn(
          "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary/90 [&_button]:hover:text-primary-foreground",
          defaultClassNames.selected
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-[var(--cell-radius)] bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted [&_button]:bg-primary [&_button]:text-primary-foreground",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "rounded-none bg-muted [&_button]:rounded-none",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "relative isolate z-0 rounded-r-[var(--cell-radius)] bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted [&_button]:bg-primary [&_button]:text-primary-foreground",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-[var(--cell-radius)] text-foreground data-[selected=true]:rounded-none [&_button]:bg-muted [&_button]:text-foreground data-[selected=true]:[&_button]:bg-primary data-[selected=true]:[&_button]:text-primary-foreground",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, ...props }) => {
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[var(--cell-size)] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
