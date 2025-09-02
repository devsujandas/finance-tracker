"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { Button } from "@/components/ui/button"

export function MonthSwitcher() {
  const { monthLabel, prevMonth, nextMonth, canGoNext } = useDashboard()

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={prevMonth} aria-label="Previous month">
        {"<"} Prev
      </Button>
      <p className="text-sm font-medium">{monthLabel}</p>
      <Button variant="outline" size="sm" onClick={nextMonth} disabled={!canGoNext} aria-label="Next month">
        Next {">"}
      </Button>
    </div>
  )
}
