// Data import/export utilities and sample data loader
import { toCSV, parseCSV } from "@/lib/csv"
import {
  loadSettings,
  saveSettings,
  loadCategories,
  saveCategories,
  loadAccounts,
  saveAccounts,
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
} from "@/lib/storage"
import type { Category, Account, Transaction, Budget, AppSettings } from "@/lib/types"

type ExportBundle = {
  version: number
  exportedAtISO: string
  settings: AppSettings | null
  categories: Category[]
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
}

export function buildExportBundle(): ExportBundle {
  return {
    version: 1,
    exportedAtISO: new Date().toISOString(),
    settings: loadSettings() ?? null,
    categories: loadCategories(),
    accounts: loadAccounts ? loadAccounts() : [],
    transactions: loadTransactions ? loadTransactions() : [],
    budgets: loadBudgets(),
  }
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportAllToJSON() {
  const bundle = buildExportBundle()
  downloadJSON("budget-tracker-export.json", bundle)
}

export async function importFromJSONFile(file: File) {
  const text = await file.text()
  const parsed = JSON.parse(text) as Partial<ExportBundle> | Transaction[] // support legacy txns-only arrays
  if (Array.isArray(parsed)) {
    // legacy transactions only
    saveTransactions?.(parsed as Transaction[])
    return
  }
  if (parsed.settings) saveSettings(parsed.settings)
  if (parsed.categories) saveCategories(parsed.categories)
  if (parsed.accounts && saveAccounts) saveAccounts(parsed.accounts)
  if (parsed.transactions && saveTransactions) saveTransactions(parsed.transactions)
  if (parsed.budgets) saveBudgets(parsed.budgets)
}

// CSV Export/Import for Transactions
// Default header order: date, amount, type, category, account, note
export function exportTransactionsToCSV() {
  const txns = loadTransactions ? loadTransactions() : []
  const headers = ["date", "amount", "type", "category", "account", "note"]
  const rows = txns.map((t) => [
    t.dateISO.slice(0, 10),
    String(t.amount),
    t.type,
    t.categoryName ?? "",
    t.accountName ?? "",
    t.note ?? "",
  ])
  const csv = toCSV(headers, rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "transactions.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type TxnCsvMapping = {
  date: string // header name for date
  amount: string // header name for amount
  type?: string // "income" | "expense" or sign inferred if missing
  category?: string
  account?: string
  note?: string
}

export function analyzeCsv(text: string) {
  const { headers, rows } = parseCSV(text)
  return { headers, sample: rows.slice(0, 5) }
}

export function importTransactionsFromCSV(text: string, mapping: TxnCsvMapping) {
  const { headers, rows } = parseCSV(text)
  const idx = (h?: string) => (h ? headers.indexOf(h) : -1)
  const iDate = idx(mapping.date)
  const iAmount = idx(mapping.amount)
  const iType = idx(mapping.type)
  const iCat = idx(mapping.category)
  const iAcc = idx(mapping.account)
  const iNote = idx(mapping.note)

  const existing = loadTransactions ? loadTransactions() : []
  const categories = loadCategories()
  const accounts = loadAccounts ? loadAccounts() : []

  const toType = (val: string | undefined, amt: number): Transaction["type"] => {
    if (val === "income" || val === "expense" || val === "transfer") return val
    // infer from sign: positive => income, negative => expense
    return amt >= 0 ? "income" : "expense"
  }

  const txns: Transaction[] = []
  for (const r of rows) {
    const dateStr = r[iDate] || ""
    const dateISO = new Date(dateStr).toISOString()
    const amount = Number(r[iAmount] || 0)
    const type = toType(iType >= 0 ? r[iType] : undefined, amount)
    // strip sign for amount; sign already captured in type
    const absAmount = Math.abs(amount)

    const catName = iCat >= 0 ? (r[iCat] || "").trim() : ""
    const accName = iAcc >= 0 ? (r[iAcc] || "").trim() : ""
    const category = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase())
    const account = accounts.find((a) => a.name.toLowerCase() === accName.toLowerCase())

    const txn: Transaction = {
      id: crypto.randomUUID(),
      dateISO,
      amount: absAmount,
      type,
      categoryId: category?.id,
      categoryName: category?.name ?? (catName || undefined),
      accountId: account?.id,
      accountName: account?.name ?? (accName || undefined),
      note: iNote >= 0 ? r[iNote] || undefined : undefined,
    } as Transaction

    txns.push(txn)
  }

  const merged = [...txns, ...existing]
  saveTransactions?.(merged)
}

// Sample Data
export function loadSampleData() {
  const now = new Date()
  const settings: AppSettings = {
    currency: "USD",
    startOfWeek: "monday",
    locale: "en-US",
  }
  const categories: Category[] = [
    { id: "cat-salary", name: "Salary", type: "income", color: "#2563eb" },
    { id: "cat-groceries", name: "Groceries", type: "expense", color: "#10b981" },
    { id: "cat-rent", name: "Rent", type: "expense", color: "#ef4444" },
    { id: "cat-entertainment", name: "Entertainment", type: "expense", color: "#f59e0b" },
  ]
  const accounts: Account[] = [
    { id: "acc-checking", name: "Checking", type: "bank" },
    { id: "acc-cash", name: "Cash", type: "cash" },
  ]
  const tx: Transaction[] = [
    {
      id: crypto.randomUUID(),
      dateISO: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      amount: 4000,
      type: "income",
      categoryId: "cat-salary",
      categoryName: "Salary",
      accountId: "acc-checking",
      accountName: "Checking",
      note: "Monthly salary",
    },
    {
      id: crypto.randomUUID(),
      dateISO: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      amount: 120,
      type: "expense",
      categoryId: "cat-groceries",
      categoryName: "Groceries",
      accountId: "acc-checking",
      accountName: "Checking",
    },
    {
      id: crypto.randomUUID(),
      dateISO: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
      amount: 1500,
      type: "expense",
      categoryId: "cat-rent",
      categoryName: "Rent",
      accountId: "acc-checking",
      accountName: "Checking",
    },
    {
      id: crypto.randomUUID(),
      dateISO: new Date(now.getFullYear(), now.getMonth(), 4).toISOString(),
      amount: 65,
      type: "expense",
      categoryId: "cat-entertainment",
      categoryName: "Entertainment",
      accountId: "acc-cash",
      accountName: "Cash",
      note: "Movies",
    },
  ]
  const budgets: Budget[] = [
    {
      id: "bud-groceries",
      period: "monthly",
      categoryId: "cat-groceries",
      amount: 500,
      startDateISO: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      carryover: true,
    },
    {
      id: "bud-entertainment",
      period: "monthly",
      categoryId: "cat-entertainment",
      amount: 150,
      startDateISO: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      carryover: false,
    },
  ]

  saveSettings(settings)
  saveCategories(categories)
  saveAccounts?.(accounts)
  saveTransactions?.(tx)
  saveBudgets(budgets)
}
