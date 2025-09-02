"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import { formatCurrency } from "@/lib/number"
import { endOfMonth, startOfMonth, addMonths, formatMonthLabel } from "@/lib/date"
import { loadSettings, loadCategories, loadTransactions, loadBudgets } from "@/lib/storage"
import type { Transaction, Budget, Category } from "@/lib/types"

type TrendPoint = { label: string; income: number; expense: number }
type PiePoint = { name: string; value: number }
type BudgetPoint = { name: string; spent: number; remaining: number }

function summarizeMonth(txns: Transaction[], cats: Category[], budgets: Budget[], monthStart: Date) {
  const monthEnd = endOfMonth(monthStart)
  const inMonth = txns.filter((t) => {
    const d = new Date(t.dateISO)
    return d >= monthStart && d <= monthEnd
  })

  const income = inMonth.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0)
  const expense = inMonth.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0)
  const savingsRate = income > 0 ? 1 - expense / income : 0

  // Category breakdown: expenses only
  const byCat = new Map<string, number>()
  for (const t of inMonth) {
    if (t.type !== "expense") continue
    const key = t.categoryId ?? "Uncategorized"
    byCat.set(key, (byCat.get(key) ?? 0) + t.amount)
  }
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? id
  const categoryBreakdown: PiePoint[] = Array.from(byCat.entries()).map(([id, val]) => ({
    name: catName(id),
    value: Math.max(0, val),
  }))

  // Budget usage per category (first budget per category)
  const spentByCat = byCat
  const usage: BudgetPoint[] = budgets
    .filter((b) => b.period === "monthly")
    .map((b) => {
      const spent = spentByCat.get(b.categoryId ?? "overall") ?? 0
      const remaining = Math.max(0, b.amount - spent)
      const name = b.categoryId ? catName(b.categoryId) : "Overall"
      return { name, spent, remaining }
    })

  return { income, expense, savingsRate, categoryBreakdown, budgetUsage: usage }
}

export function useDashboard() {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()))

  const { data } = useSWR(
    ["bt:dashboard", cursor.toISOString()],
    async () => {
      const settings = loadSettings()
      const categories = loadCategories()
      const transactions = loadTransactions()
      const budgets = loadBudgets()
      return { settings, categories, transactions, budgets }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const monthLabel = useMemo(() => formatMonthLabel(cursor), [cursor])
  const canGoNext = useMemo(() => {
    const now = startOfMonth(new Date())
    return cursor < now
  }, [cursor])

  const prevMonth = () => setCursor((d) => addMonths(d, -1))
  const nextMonth = () => setCursor((d) => (canGoNext ? addMonths(d, 1) : d))

  const { kpis, trend, categoryBreakdown, budgetUsage } = useMemo(() => {
    const settings = data?.settings
    const currency = settings?.currency ?? "USD"
    const categories = data?.categories ?? []
    const transactions = data?.transactions ?? []
    const budgets = data?.budgets ?? []

    // KPIs for current month
    const monthSummary = summarizeMonth(transactions, categories, budgets, cursor)
    const totalIncomeAll = transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0)
    const totalExpenseAll = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0)
    const totalBalance = totalIncomeAll - totalExpenseAll

    // 12-month trend
    const months: TrendPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const start = startOfMonth(addMonths(cursor, -i))
      const s = summarizeMonth(transactions, categories, budgets, start)
      months.push({
        label: formatMonthLabel(start),
        income: s.income,
        expense: s.expense,
      })
    }

    return {
      kpis: {
        totalBalance: formatCurrency(totalBalance, currency),
        incomeMonth: formatCurrency(monthSummary.income, currency),
        expenseMonth: formatCurrency(monthSummary.expense, currency),
        savingsRate: `${Math.round(monthSummary.savingsRate * 100)}%`,
      },
      trend: months,
      categoryBreakdown: monthSummary.categoryBreakdown,
      budgetUsage: monthSummary.budgetUsage,
    }
  }, [cursor, data])

  return {
    monthLabel,
    canGoNext,
    prevMonth,
    nextMonth,
    kpis,
    trend,
    categoryBreakdown,
    budgetUsage,
  }
}
