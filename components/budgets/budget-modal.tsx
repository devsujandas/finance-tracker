"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadCategories, loadSettings } from "@/lib/storage"
import type { Budget } from "@/lib/types"

export function BudgetModal({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: Budget | null
  onSubmit: (b: Budget) => void
}) {
  const settings = loadSettings()
  const categories = useMemo(() => loadCategories(), [])
  const [id, setId] = useState(editing?.id ?? "")
  const [period, setPeriod] = useState<Budget["period"]>(editing?.period ?? "monthly")
  const [categoryId, setCategoryId] = useState<string | undefined>(editing?.categoryId)
  const [amount, setAmount] = useState<number>(editing?.amount ?? 0)
  const [startDateISO, setStartDateISO] = useState<string>(
    editing?.startDateISO ?? new Date().toISOString().slice(0, 10),
  )
  const [carryover, setCarryover] = useState<boolean>(editing?.carryover ?? true)

  useEffect(() => {
    setId(editing?.id ?? crypto.randomUUID())
  }, [editing])

  if (!open) return null

  const submit = () => {
    if (amount <= 0) return
    const b: Budget = {
      id,
      period,
      categoryId: categoryId || undefined,
      amount: Math.abs(Number(amount) || 0),
      startDateISO: new Date(startDateISO).toISOString(),
      carryover,
    }
    onSubmit(b)
    onOpenChange(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/40 md:items-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full rounded-t-xl bg-background p-4 shadow-2xl md:mx-auto md:max-w-md md:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium">{editing ? "Edit" : "Add"} Budget</h2>
          <Button variant="ghost" onClick={() => onOpenChange(false)} aria-label="Close">
            Close
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="period">Period</Label>
            <select
              id="period"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Budget["period"])}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category (optional)</Label>
            <select
              id="category"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
            >
              <option value="">All expenses</option>
              {categories
                .filter((c) => c.type === "expense")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount ({settings?.currency ?? "USD"})</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" value={startDateISO} onChange={(e) => setStartDateISO(e.target.value)} />
          </div>

          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={carryover} onChange={(e) => setCarryover(e.target.checked)} />
            Enable carryover (unused budget adds to next period)
          </label>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? "Save" : "Add"}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
