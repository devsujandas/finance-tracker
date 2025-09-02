import type { AppSettings, Category, Transaction, Budget, Account } from "./types"

const NS = "bt:"

export function loadSettings(): AppSettings | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(NS + "settings")
    return raw ? (JSON.parse(raw) as AppSettings) : null
  } catch {
    return null
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NS + "settings", JSON.stringify(s))
  } catch {}
}

export function loadCategories(): Category[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NS + "categories")
    return raw ? (JSON.parse(raw) as Category[]) : []
  } catch {
    return []
  }
}

export function saveCategories(cats: Category[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NS + "categories", JSON.stringify(cats))
  } catch {}
}

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NS + "transactions")
    return raw ? (JSON.parse(raw) as Transaction[]) : []
  } catch {
    return []
  }
}

export function saveTransactions(txns: Transaction[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NS + "transactions", JSON.stringify(txns))
  } catch {}
}

export function loadBudgets(): Budget[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NS + "budgets")
    return raw ? (JSON.parse(raw) as Budget[]) : []
  } catch {
    return []
  }
}

export function saveBudgets(budgets: Budget[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NS + "budgets", JSON.stringify(budgets))
  } catch {}
}

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NS + "accounts")
    return raw ? (JSON.parse(raw) as Account[]) : []
  } catch {
    return []
  }
}

export function saveAccounts(accts: Account[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NS + "accounts", JSON.stringify(accts))
  } catch {}
}

export function resetAllData() {
  if (typeof window === "undefined") return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(NS)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {}
}

const LOCK_KEY = NS + "lock"

export function getLockState(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(LOCK_KEY) === "1"
  } catch {
    return false
  }
}

export function setLockState(v: boolean) {
  if (typeof window === "undefined") return
  try {
    if (v) {
      localStorage.setItem(LOCK_KEY, "1")
    } else {
      localStorage.removeItem(LOCK_KEY)
    }
  } catch {}
}
