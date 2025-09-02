"use client"

import { useState, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { loadCategories } from "@/lib/storage"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/number"
import { useVirtualizer } from "@tanstack/react-virtual"
import { AddEditTransactionModal } from "@/components/transactions/transaction-modal"

export default function TransactionsPage() {
  const { toast } = useToast()
  const { txns, add, update, remove, removeMany } = useTransactions()
  const { accounts } = useAccounts()
  const categories = useMemo(() => loadCategories(), [])

  // Filters
  const [q, setQ] = useState("")
  const [type, setType] = useState<"all" | "income" | "expense" | "transfer">("all")
  const [cat, setCat] = useState<string>("all")
  const [acct, setAcct] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const typeAll = type === "all"
    const catAll = cat === "all"
    const acctAll = acct === "all"

    return txns.filter((t) => {
      if (!typeAll && t.type !== type) return false
      if (!catAll && t.categoryId !== cat) return false
      if (!acctAll && t.accountId !== acct) return false
      if (from && new Date(t.dateISO) < new Date(from)) return false
      if (to && new Date(t.dateISO) > new Date(to)) return false
      if (q) {
        const hay = [t.notes ?? "", ...(t.tags ?? [])].join(" ").toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [txns, type, cat, acct, from, to, q])

  // Virtualized list
  const parentRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: () => 64,
    overscan: 8,
  })

  // Modal state
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const onDelete = (id: string) => {
    const snapshot = [...txns]
    remove(id)
    toast({
      title: "Transaction deleted",
      description: "Undo?",
    })
    // Simple undo within 5s if needed
    const timer = setTimeout(() => {}, 5000)
    // Expose undo via window for now
    ;(window as any).__undo = () => {
      clearTimeout(timer)
      // restore
      // naive restore: replace all
      // in a real app we’d store delta; keeping simple here
      // @ts-ignore
      import("@/lib/storage").then(({ saveTransactions }) => saveTransactions(snapshot))
      // trigger reload
      location.reload()
    }
  }

  const onBulkDelete = () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    removeMany(ids)
    setSelected(new Set())
    toast({ title: "Deleted", description: `${ids.length} transactions removed.` })
  }

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const exportSelected = () => {
    const items = txns.filter((t) => selected.has(t.id))
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectAllFiltered = () => setSelected(new Set(filtered.map((t) => t.id)))
  const clearSelection = () => setSelected(new Set())

  return (
    <section className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-pretty text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">Search and manage your transactions</p>
      </header>

      {/* Filters */}
      <div className="rounded-lg border p-3">
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="Search notes/tags" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="all">all</option>
                <option value="income">income</option>
                <option value="expense">expense</option>
                <option value="transfer">transfer</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <select
                id="account"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={acct}
                onChange={(e) => setAcct(e.target.value)}
              >
                <option value="all">All</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Add Transaction
          </Button>
          <Button variant="outline" onClick={exportSelected} disabled={selected.size === 0}>
            Export Selected
          </Button>
          <Button variant="destructive" onClick={onBulkDelete} disabled={selected.size === 0}>
            Delete Selected
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={selectAllFiltered} disabled={filtered.length === 0}>
              Select All ({filtered.length})
            </Button>
            <Button variant="ghost" onClick={clearSelection} disabled={selected.size === 0}>
              Clear ({selected.size})
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        ref={parentRef}
        className="mt-4 h-[60vh] overflow-auto rounded-lg border"
        role="list"
        aria-label="Transactions"
      >
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            No transactions match your filters.
          </div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((row) => {
              const t = filtered[row.index]
              const isIncome = t.type === "income"
              const isExpense = t.type === "expense"
              const color = isIncome ? "text-emerald-600" : isExpense ? "text-red-600" : "text-foreground"
              return (
                <div
                  key={t.id}
                  role="listitem"
                  className="absolute left-0 right-0 border-b p-3"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label="Select transaction"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                      />
                      <span className="text-sm">{new Date(t.dateISO).toLocaleDateString()}</span>
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {t.notes || (t.categoryId ? categories.find((c) => c.id === t.categoryId)?.name : "—")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.accountId && accounts.find((a) => a.id === t.accountId)?.name}
                        {t.type === "transfer" && t.counterpartyAccountId
                          ? ` → ${accounts.find((a) => a.id === t.counterpartyAccountId)?.name ?? ""}`
                          : ""}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${color}`}>
                      {isExpense ? "-" : ""}
                      {formatCurrency(t.amount, t.currency)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(t)
                          setOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddEditTransactionModal
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onClose={() => setEditing(null)}
        onSubmit={(t) => {
          if (editing) {
            update(t)
          } else {
            add(t)
          }
          setOpen(false)
          setEditing(null)
          toast({ title: editing ? "Transaction updated" : "Transaction added" })
        }}
      />
    </section>
  )
}
