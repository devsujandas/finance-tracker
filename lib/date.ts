export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}
export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
export function formatMonthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" })
}
