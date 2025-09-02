"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccounts } from "@/hooks/use-accounts"
import { loadCategories, loadSettings } from "@/lib/storage"
import type { Transaction } from "@/lib/types"
import { nextOccurrence } from "@/lib/recurrence"

export function AddEditTransactionModal({
  open,
  onOpenChange,
  editing,
  onClose,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: Transaction | null
  onClose: () => void
  onSubmit: (t: Transaction) => void
}) {
  const accounts = useAccounts().accounts
  const categories = useMemo(() => loadCategories(), [])
  const currency = loadSettings()?.currency ?? "USD"

  const [id, setId] = useState(editing?.id ?? "")
  const [type, setType] = useState<Transaction["type"]>(editing?.type ?? "expense")
  const [amount, setAmount] = useState<number>(editing?.amount ?? 0)
  const [dateISO, setDateISO] = useState<string>(editing?.dateISO ?? new Date().toISOString().slice(0, 10))
  const [categoryId, setCategoryId] = useState<string | undefined>(editing?.categoryId)
  const [accountId, setAccountId] = useState<string | undefined>(editing?.accountId ?? accounts[0]?.id)
  const [counterpartyAccountId, setCounterpartyAccountId] = useState<string | undefined>(editing?.counterpartyAccountId)
  const [notes, setNotes] = useState<string>(editing?.notes ?? "")
  const [tags, setTags] = useState<string>((editing?.tags ?? []).join("|"))
  const [attachmentUrl, setAttachmentUrl] = useState<string>(editing?.attachmentUrl ?? "")
  const [recurring, setRecurring] = useState<boolean>(!!editing?.recurringRule)
  const [freq, setFreq] = useState<"daily" | "weekly" | "monthly" | "custom">(editing?.recurringRule?.freq ?? "monthly")
  const [interval, setInterval] = useState<number>(editing?.recurringRule?.interval ?? 1)
  const [byMonthDay, setByMonthDay] = useState<string>((editing?.recurringRule?.byMonthDay ?? []).join(","))
  const [endDateISO, setEndDateISO] = useState<string>(editing?.recurringRule?.endDateISO ?? "")

  useEffect(() => {
    if (editing) {
      setId(editing.id)
    } else {
      setId(crypto.randomUUID())
    }
  }, [editing])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    } else {
      // ensure unlocked when closed
      document.body.style.overflow = ""
    }
  }, [open])

  const nextDate = useMemo(() => {
    return nextOccurrence(
      dateISO,
      recurring
        ? {
            freq,
            interval,
            byMonthDay: byMonthDay
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => Number(s))
              .filter((n) => Number.isFinite(n)),
            endDateISO: endDateISO || undefined,
          }
        : undefined,
    )
  }, [dateISO, recurring, freq, interval, byMonthDay, endDateISO])

  const submit = () => {
    // validation
    if (amount < 0 && type !== "transfer") return
    if (type === "transfer") {
      if (!accountId || !counterpartyAccountId || accountId === counterpartyAccountId) return
    }
    const t: Transaction = {
      id,
      type,
      amount: Math.abs(amount),
      currency,
      dateISO: new Date(dateISO).toISOString(),
      categoryId: type === "expense" || type === "income" ? categoryId : undefined,
      accountId,
      counterpartyAccountId: type === "transfer" ? counterpartyAccountId : undefined,
      notes: notes || undefined,
      tags: tags
        ? tags
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      attachmentUrl: attachmentUrl || undefined,
      recurringRule: recurring
        ? {
            freq,
            interval: Math.max(1, Number(interval) || 1),
            byMonthDay:
              freq === "monthly" && byMonthDay
                ? byMonthDay
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => Number.isFinite(n))
                : undefined,
            endDateISO: endDateISO || undefined,
          }
        : undefined,
    }
    onSubmit(t)
    onOpenChange(false)
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/40 md:items-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-h-[90vh] overflow-hidden rounded-t-xl bg-background p-4 shadow-2xl md:mx-auto md:max-w-lg md:rounded-xl md:p-5 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium">{editing ? "Edit" : "Add"} Transaction</h2>
          <Button variant="ghost" onClick={() => onOpenChange(false)} aria-label="Close">
            Close
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="expense">expense</option>
                <option value="income">income</option>
                <option value="transfer">transfer</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                // Show placeholder "0" by making the input visually empty when amount === 0
                value={amount === 0 ? "" : amount}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value ?? ""
                  // Normalize: remove leading zeros unless it's "0" or starts with "0."
                  const normalized =
                    raw.startsWith("0.") || raw === "0" || raw === "" ? raw : raw.replace(/^0+(?=\d)/, "")
                  const next = Number.parseFloat(normalized)
                  setAmount(Number.isFinite(next) && next >= 0 ? next : 0)
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>

            {(type === "expense" || type === "income") && (
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={categoryId ?? ""}
                  onChange={(e) => setCategoryId(e.target.value || undefined)}
                >
                  <option value="">—</option>
                  {categories
                    .filter((c) => (type === "income" ? c.type === "income" : c.type === "expense"))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <select
                id="account"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={accountId ?? ""}
                onChange={(e) => setAccountId(e.target.value || undefined)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" && (
              <div className="grid gap-2">
                <Label htmlFor="counterparty">Transfer To</Label>
                <select
                  id="counterparty"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={counterpartyAccountId ?? ""}
                  onChange={(e) => setCounterpartyAccountId(e.target.value || undefined)}
                >
                  <option value="">—</option>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (pipe-separated)</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work|travel" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attachment">Attachment URL</Label>
              <Input id="attachment" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                  Recurring
                </label>
                {recurring && (
                  <p className="text-xs text-muted-foreground">
                    Next: {nextDate ? new Date(nextDate).toLocaleDateString() : "—"}
                  </p>
                )}
              </div>

              {recurring && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="freq">Frequency</Label>
                    <select
                      id="freq"
                      className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                      value={freq}
                      onChange={(e) => setFreq(e.target.value as any)}
                    >
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="monthly">monthly</option>
                      <option value="custom">custom</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="interval">Interval</Label>
                    <Input
                      id="interval"
                      type="number"
                      min={1}
                      step="1"
                      value={interval}
                      onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Every {interval} {freq === "monthly" ? "month(s)" : freq === "weekly" ? "week(s)" : "day(s)"}.
                    </p>
                  </div>

                  {freq === "monthly" && (
                    <div className="grid gap-2">
                      <Label htmlFor="bymonthday">Days of Month (optional)</Label>
                      <Input
                        id="bymonthday"
                        placeholder="e.g. 1,15,28"
                        value={byMonthDay}
                        onChange={(e) => setByMonthDay(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated month days. Leave blank to repeat on the same day number.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="enddate">End Date (optional)</Label>
                    <Input
                      id="enddate"
                      type="date"
                      value={endDateISO}
                      onChange={(e) => setEndDateISO(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit} aria-label={editing ? "Save changes" : "Add transaction"}>
            {editing ? "Save" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  )
}
