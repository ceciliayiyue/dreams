import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-gray-100 rounded-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-gray-900",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-900 border-gray-300"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse px-1",
        head_row: "flex justify-between w-full mb-2",
        head_cell:
          "text-gray-600 w-7 font-medium text-[0.7rem] flex items-center justify-center",
        row: "flex w-full justify-between mb-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-purple-200 [&:has([aria-selected].day-range-end)]:rounded-r-md w-7",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-6 p-0 font-medium aria-selected:opacity-100 text-white bg-purple-500 hover:bg-purple-700 hover:text-white text-xs rounded-full shadow-sm"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-purple-300 aria-selected:text-purple-900",
        day_range_end:
          "day-range-end aria-selected:bg-purple-300 aria-selected:text-purple-900",
        day_selected:
          "bg-purple-700 text-white hover:bg-purple-800 hover:text-white focus:bg-purple-700 focus:text-white font-bold border-purple-600 shadow-md",
        day_today: "bg-blue-500 text-white font-medium border border-blue-400 shadow-md",
        day_outside:
          "day-outside text-gray-200 aria-selected:text-gray-200 bg-gray-400 opacity-50",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-purple-200 aria-selected:text-purple-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
