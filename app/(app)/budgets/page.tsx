"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useBudgets } from "@/hooks/use-budgets"
import { useTransactions } from "@/hooks/use-transactions"
import { BudgetModal } from "@/components/budgets/budget-modal"
import { loadCategories, loadSettings } from "@/lib/storage"
import { formatCurrency } from "@/lib/number"
import type { Budget, Transaction } from "@/lib/types"

// Helpers
function isExpenseTxn(t: Transaction) {
  return t.type === "expense"
}
function within(dISO: string, start: Date, end: Date) {
  const d = new Date(dISO)
  return d >= start && d <= end
}
function startOfWeek(date: Date, startsOnMonday: boolean) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = startsOnMonday ? (day === 0 ? -6 : 1 - day) : -day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
function endOfWeek(date: Date, startsOnMonday: boolean) {
  const s = startOfWeek(date, startsOnMonday)
  const e = new Date(s)
  e.setDate(s.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}
function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}
function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}
function prevPeriodRange(b: Budget, now: Date, startsOnMonday: boolean) {
  if (b.period === "weekly") {
    const currentStart = startOfWeek(now, startsOnMonday)
    const prevEnd = new Date(currentStart)
    prevEnd.setDate(prevEnd.getDate() - 1)
    const prevStart = startOfWeek(prevEnd, startsOnMonday)
    return [prevStart, endOfWeek(prevStart, startsOnMonday)] as const
  } else {
    const currentStart = startOfMonth(now)
    const prev = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1)
    return [startOfMonth(prev), endOfMonth(prev)] as const
  }
}
function currentPeriodRange(b: Budget, now: Date, startsOnMonday: boolean) {
  if (b.period === "weekly") {
    return [startOfWeek(now, startsOnMonday), endOfWeek(now, startsOnMonday)] as const
  } else {
    return [startOfMonth(now), endOfMonth(now)] as const
  }
}

export default function BudgetsPage() {
  const { budgets, add, update, remove } = useBudgets()
  const { txns } = useTransactions()
  const categories = useMemo(() => loadCategories(), [])
  const settings = loadSettings()
  const currency = settings?.currency ?? "USD"
  const startsOnMonday = (settings?.startOfWeek ?? "monday") === "monday"

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)

  const rows = useMemo(() => {
    const now = new Date()
    return budgets.map((b) => {
      const [curStart, curEnd] = currentPeriodRange(b, now, startsOnMonday)
      const [prevStart, prevEnd] = prevPeriodRange(b, now, startsOnMonday)

      // Filter expenses by period and category (if provided)
      const matchesScope = (t: Transaction) => isExpenseTxn(t) && (!b.categoryId || t.categoryId === b.categoryId)

      const spentPrev = txns
        .filter((t) => matchesScope(t) && within(t.dateISO, prevStart, prevEnd))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      // simple carryover: only last completed period's leftover
      const carry = b.carryover ? Math.max(0, b.amount - spentPrev) : 0

      const spentCur = txns
        .filter((t) => matchesScope(t) && within(t.dateISO, curStart, curEnd))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const limit = b.amount + carry
      const usedPct = limit > 0 ? Math.min(100, Math.round((spentCur / limit) * 100)) : 0
      const alert = spentCur > limit ? "over" : usedPct >= 90 ? "high" : undefined

      return {
        budget: b,
        curStart,
        curEnd,
        carry,
        spentCur,
        limit,
        usedPct,
        alert,
      }
    })
  }, [budgets, txns, startsOnMonday])

  return (
    <section className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-2xl font-semibold">Budgets</h1>
          <p className="text-sm text-muted-foreground">Create and track category budgets</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Add Budget
        </Button>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">No budgets yet.</div>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-3">
          {rows.map(({ budget: b, spentCur, limit, usedPct, carry, alert, curStart, curEnd }) => {
            const catName = b.categoryId
              ? (categories.find((c) => c.id === b.categoryId)?.name ?? "Unknown")
              : "All expenses"
            const barColor = alert === "over" ? "bg-red-600" : alert === "high" ? "bg-amber-500" : "bg-emerald-600"
            const srAlert = alert === "over" ? "Over budget" : alert === "high" ? "Approaching budget limit" : undefined

            return (
              <li key={b.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{catName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.period === "monthly" ? "Monthly" : "Weekly"} · {new Date(curStart).toLocaleDateString()} –{" "}
                      {new Date(curEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(spentCur, currency)} / {formatCurrency(limit, currency)}
                    </p>
                    {b.carryover && carry > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Includes {formatCurrency(carry, currency)} carryover
                      </p>
                    )}
                  </div>
                </div>

                <div
                  aria-label="Budget usage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={usedPct}
                  role="progressbar"
                  className="h-2 w-full overflow-hidden rounded bg-muted"
                >
                  <div className={`h-full ${barColor}`} style={{ width: `${usedPct}%` }} />
                </div>
                {srAlert && (
                  <p className="sr-only" aria-live="polite">
                    {srAlert}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // open edit modal
                      setEditing(b)
                      setOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(b.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <BudgetModal
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(bud) => {
          if (editing) {
            update(bud)
          } else {
            add(bud)
          }
          setEditing(null)
        }}
      />
    </section>
  )
}
