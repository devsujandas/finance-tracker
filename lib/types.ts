export type Category = {
  id: string
  name: string
  type: "income" | "expense"
  color?: string
  icon?: string
}

export type AppSettings = {
  currency: string
  locale: string
  theme: "light" | "dark" | "system"
  startOfWeek: "monday" | "sunday"
  startOfMonth: number
  density: "comfortable" | "compact"
}

export type Account = {
  id: string
  name: string
  type: "cash" | "bank" | "wallet" | "card"
  openingBalance: number
}

export type Transaction = {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  currency: string
  dateISO: string
  categoryId?: string
  subcategoryId?: string
  accountId?: string
  counterpartyAccountId?: string
  notes?: string
  tags?: string[]
  attachmentUrl?: string
  recurringRule?: {
    freq: "daily" | "weekly" | "monthly" | "custom"
    interval: number
    byMonthDay?: number[]
    endDateISO?: string
  }
}

export type Budget = {
  id: string
  period: "monthly" | "weekly"
  categoryId?: string
  amount: number
  startDateISO: string
  carryover: boolean
}
