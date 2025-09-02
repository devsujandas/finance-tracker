import { loadSettings } from "./storage"

export function formatCurrency(value: number, currency?: string, locale?: string, maximumFractionDigits = 0) {
  try {
    const s = loadSettings()
    const cur = currency ?? s?.currency ?? "USD"
    const loc = locale ?? s?.locale // undefined falls back to the runtime default
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: cur,
      maximumFractionDigits,
    }).format(value)
  } catch {
    // Fallback: keep basic formatting with $
    return `$${Math.round(value)}`
  }
}
