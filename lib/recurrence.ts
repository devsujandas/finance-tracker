export function nextOccurrence(
  dateISO: string,
  rule?: {
    freq: "daily" | "weekly" | "monthly" | "custom"
    interval: number
    byMonthDay?: number[]
    endDateISO?: string
  },
): string | null {
  if (!rule) return null
  const start = new Date(dateISO)
  if (Number.isNaN(start.getTime())) return null

  const clone = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  let next = clone(start)
  switch (rule.freq) {
    case "daily":
      next.setDate(next.getDate() + Math.max(1, rule.interval))
      break
    case "weekly":
      next.setDate(next.getDate() + 7 * Math.max(1, rule.interval))
      break
    case "monthly":
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        // Pick the next listed day in this/next months
        const today = start.getDate()
        const sorted = [...rule.byMonthDay].sort((a, b) => a - b)
        const nextDay = sorted.find((d) => d > today)
        if (nextDay) {
          next = new Date(start.getFullYear(), start.getMonth(), nextDay)
        } else {
          // move to next month’s first configured day
          const m = new Date(start.getFullYear(), start.getMonth() + Math.max(1, rule.interval), 1)
          next = new Date(m.getFullYear(), m.getMonth(), sorted[0])
        }
      } else {
        next = new Date(start.getFullYear(), start.getMonth() + Math.max(1, rule.interval), start.getDate())
      }
      break
    case "custom":
      // Treat like monthly interval if unspecified
      next = new Date(start.getFullYear(), start.getMonth() + Math.max(1, rule.interval), start.getDate())
      break
  }

  if (rule.endDateISO) {
    const end = new Date(rule.endDateISO)
    if (next > end) return null
  }
  return next.toISOString()
}
