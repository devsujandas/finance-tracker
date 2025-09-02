"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  exportAllToJSON,
  importFromJSONFile,
  exportTransactionsToCSV,
  analyzeCsv,
  importTransactionsFromCSV,
  type TxnCsvMapping,
} from "@/lib/io"

export function ImportExportSection() {
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvText, setCsvText] = useState<string>("")
  const [mapping, setMapping] = useState<TxnCsvMapping>({
    date: "",
    amount: "",
    type: undefined,
    category: undefined,
    account: undefined,
    note: undefined,
  })

  const canImportCsv = useMemo(() => {
    return csvText.length > 0 && mapping.date && mapping.amount
  }, [csvText, mapping])

  const onPickJSON = () => jsonInputRef.current?.click()
  const onPickCSV = () => csvInputRef.current?.click()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="text-base font-semibold">Backup & Restore</h3>
        <p className="text-sm text-muted-foreground">
          Export or import all data (settings, categories, accounts, transactions, budgets).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={() => exportAllToJSON()}>Export JSON</Button>
          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              await importFromJSONFile(f)
              // naive refresh to show new data everywhere
              window.location.reload()
            }}
          />
          <Button variant="outline" onClick={onPickJSON}>
            Import JSON
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="text-base font-semibold">Transactions CSV</h3>
        <p className="text-sm text-muted-foreground">Export transactions or import from a CSV with column mapping.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={() => exportTransactionsToCSV()}>Export CSV</Button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const t = await f.text()
              const { headers } = analyzeCsv(t)
              setCsvHeaders(headers)
              setCsvText(t)
            }}
          />
          <Button variant="outline" onClick={onPickCSV}>
            Import CSV
          </Button>
        </div>

        {csvHeaders.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            <p className="text-sm font-medium">Map CSV Columns</p>

            <div className="grid gap-1">
              <Label>Date</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.date}
                onChange={(e) => setMapping((m) => ({ ...m, date: e.target.value }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`date-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Amount</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.amount}
                onChange={(e) => setMapping((m) => ({ ...m, amount: e.target.value }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`amount-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Type (optional)</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.type ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, type: e.target.value || undefined }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`type-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                If omitted, type is inferred by sign: positive = income, negative = expense.
              </p>
            </div>

            <div className="grid gap-1">
              <Label>Category (optional)</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.category ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, category: e.target.value || undefined }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`cat-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Account (optional)</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.account ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, account: e.target.value || undefined }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`acc-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Note (optional)</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={mapping.note ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, note: e.target.value || undefined }))}
              >
                <option value="">Select column…</option>
                {csvHeaders.map((h) => (
                  <option key={`note-${h}`} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Button
                disabled={!canImportCsv}
                onClick={() => {
                  if (!canImportCsv) return
                  importTransactionsFromCSV(csvText, mapping)
                  // reset state and refresh
                  setCsvHeaders([])
                  setCsvText("")
                  window.location.reload()
                }}
              >
                Import Transactions
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCsvHeaders([])
                  setCsvText("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
