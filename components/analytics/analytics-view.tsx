"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useBudgets } from "@/hooks/use-budgets"
import { loadCategories, loadSettings } from "@/lib/storage"
import { formatCurrency } from "@/lib/number"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { exportPngFromSvgElement } from "@/lib/export"

type Range = "month" | "quarter" | "ytd"
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function monthsBack(n: number) {
  const now = new Date()
  const arr: Date[] = []
  for (let i = n - 1; i >= 0; i--) arr.push(addMonths(startOfMonth(now), -i))
  return arr
}

function SimpleTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean
  payload?: Array<any>
  label?: string | number
  currency: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-background p-2 text-xs shadow-sm">
      {label != null ? <div className="mb-1 font-medium">{String(label)}</div> : null}
      <div className="grid gap-1">
        {payload.map((item, i) => {
          const seriesName =
            (typeof item?.name === "string" && item.name) ||
            (typeof item?.dataKey === "string" && item.dataKey) ||
            "Series"
          const color = item?.color || "hsl(var(--foreground))"
          const value =
            typeof item?.value === "number" ? formatCurrency(item.value, currency) : String(item?.value ?? "")
          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-muted-foreground">{seriesName}</span>
              </div>
              <span className="font-medium">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AnalyticsView() {
  const { txns } = useTransactions()
  const { budgets } = useBudgets()
  const categories = useMemo(() => loadCategories(), [])
  const settings = loadSettings()
  const currency = settings?.currency ?? "USD"
  const enableDL = !!settings?.enableChartDownloads
  const hideBalances = !!settings?.hideBalances

  const [range, setRange] = useState<Range>("month")
  const [account, setAccount] = useState<string>("all")

  // Filters and KPI aggregates
  const { filtered, income, expense, savings, budgetPct } = useMemo(() => {
    const now = new Date()
    let start: Date
    if (range === "ytd") start = new Date(now.getFullYear(), 0, 1)
    else if (range === "quarter") start = addMonths(startOfMonth(now), -2)
    else start = startOfMonth(now)
    const end = endOfMonth(now)

    const filtered = txns.filter((t) => {
      if (account && account !== "all" && t.accountId !== account) return false
      const d = new Date(t.dateISO)
      return d >= start && d <= end
    })

    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0)
    const savings = Math.max(0, income - expense)

    // Simple budget usage for current month
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const monthExpenses = txns
      .filter((t) => t.type === "expense" && new Date(t.dateISO) >= monthStart && new Date(t.dateISO) <= monthEnd)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0) || 0
    const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((monthExpenses / totalBudget) * 100)) : 0

    return { filtered, income, expense, savings, budgetPct }
  }, [txns, budgets, range, account])

  // Trend: last 12 months income/expense
  const trend = useMemo(() => {
    const months = monthsBack(12)
    return months.map((m) => {
      const start = startOfMonth(m)
      const end = endOfMonth(m)
      const label = start.toLocaleString(undefined, { month: "short" })
      const inc = txns
        .filter((t) => t.type === "income" && new Date(t.dateISO) >= start && new Date(t.dateISO) <= end)
        .reduce((s, t) => s + t.amount, 0)
      const exp = txns
        .filter((t) => t.type === "expense" && new Date(t.dateISO) >= start && new Date(t.dateISO) <= end)
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      return { name: label, income: inc, expense: exp }
    })
  }, [txns])

  // Category breakdown (expenses) for current filter range
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of filtered) {
      if (t.type !== "expense") continue
      const key = t.categoryId || "uncategorized"
      map.set(key, (map.get(key) || 0) + Math.abs(t.amount))
    }
    const arr = Array.from(map.entries()).map(([id, total]) => ({
      id,
      name: id === "uncategorized" ? "Uncategorized" : (categories.find((c) => c.id === id)?.name ?? "Unknown"),
      total,
    }))
    arr.sort((a, b) => b.total - a.total)
    return arr
  }, [filtered, categories])

  const topCategory = byCategory[0]?.name ?? "—"
  const avgDailySpend = useMemo(() => {
    if (filtered.length === 0) return 0
    const dayMap = new Map<string, number>()
    for (const t of filtered) {
      if (t.type !== "expense") continue
      const d = new Date(t.dateISO).toISOString().slice(0, 10)
      dayMap.set(d, (dayMap.get(d) || 0) + Math.abs(t.amount))
    }
    const totals = Array.from(dayMap.values())
    return totals.length ? totals.reduce((s, x) => s + x, 0) / totals.length : 0
  }, [filtered])

  const trendRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const pieRef = useRef<HTMLDivElement>(null)

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Understand trends and breakdowns</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick filters */}
          <select
            aria-label="Time range"
            className="rounded-md border bg-background px-2 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
          >
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="ytd">Year to Date</option>
          </select>
          <select
            aria-label="Account"
            className="rounded-md border bg-background px-2 py-2 text-sm"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            <option value="all">All Accounts</option>
          </select>
        </div>
      </header>

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Income</CardDescription>
            <CardTitle
              className={hideBalances ? "text-2xl blur-sm cursor-pointer select-none" : "text-2xl"}
              title={hideBalances ? "Click to reveal" : undefined}
              onClick={(e) => e.currentTarget.classList.remove("blur-sm")}
            >
              {formatCurrency(income, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expenses</CardDescription>
            <CardTitle
              className={hideBalances ? "text-2xl blur-sm cursor-pointer select-none" : "text-2xl"}
              title={hideBalances ? "Click to reveal" : undefined}
              onClick={(e) => e.currentTarget.classList.remove("blur-sm")}
            >
              {formatCurrency(expense, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Savings</CardDescription>
            <CardTitle
              className={hideBalances ? "text-2xl blur-sm cursor-pointer select-none" : "text-2xl"}
              title={hideBalances ? "Click to reveal" : undefined}
              onClick={(e) => e.currentTarget.classList.remove("blur-sm")}
            >
              {formatCurrency(savings, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Used</CardDescription>
            <CardTitle className="text-2xl">{budgetPct}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Line: 12-month trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base">12-Month Trend</CardTitle>
              <CardDescription>Income vs Expenses</CardDescription>
            </div>
            {enableDL && (
              <button
                className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                onClick={() => {
                  const svg = trendRef.current?.querySelector("svg")
                  if (svg) exportPngFromSvgElement(svg as any, "trend.png")
                }}
              >
                Download PNG
              </button>
            )}
          </CardHeader>
          <CardContent ref={trendRef}>
            <ChartContainer
              config={{
                income: { label: "Income", color: "hsl(var(--chart-1))" },
                expense: { label: "Expense", color: "hsl(var(--chart-2))" },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<SimpleTooltip currency={currency} />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="var(--color-income)" dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar: Top categories (expenses) */}
        <Card>
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base">Top Categories</CardTitle>
              <CardDescription>Expenses in selected range</CardDescription>
            </div>
            {enableDL && (
              <button
                className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                onClick={() => {
                  const svg = barRef.current?.querySelector("svg")
                  if (svg) exportPngFromSvgElement(svg as any, "top-categories.png")
                }}
              >
                Download PNG
              </button>
            )}
          </CardHeader>
          <CardContent ref={barRef}>
            <ChartContainer
              config={{
                total: { label: "Total", color: "hsl(var(--chart-3))" },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory.slice(0, 8)} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<SimpleTooltip currency={currency} />} />
                  <Bar dataKey="total" fill="var(--color-total)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie: Composition */}
        <Card>
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base">Composition</CardTitle>
              <CardDescription>Income vs Expenses vs Transfers</CardDescription>
            </div>
            {enableDL && (
              <button
                className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                onClick={() => {
                  const svg = pieRef.current?.querySelector("svg")
                  if (svg) exportPngFromSvgElement(svg as any, "composition.png")
                }}
              >
                Download PNG
              </button>
            )}
          </CardHeader>
          <CardContent ref={pieRef}>
            <ChartContainer
              className="h-[280px]"
              config={{
                income: { label: "Income", color: "hsl(var(--chart-1))" },
                expense: { label: "Expenses", color: "hsl(var(--chart-2))" },
                transfer: { label: "Transfers", color: "hsl(var(--chart-3))" },
                value: { label: "Amount", color: "hsl(var(--chart-4))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<SimpleTooltip currency={currency} />} />
                  <Pie
                    data={[
                      {
                        name: "Income",
                        value: filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
                      },
                      {
                        name: "Expenses",
                        value: filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0),
                      },
                      {
                        name: "Transfers",
                        value: filtered
                          .filter((t) => t.type === "transfer")
                          .reduce((s, t) => s + Math.abs(t.amount), 0),
                      },
                    ]}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {COLORS.slice(0, 3).map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle className="text-lg">{topCategory}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Daily Spend</CardDescription>
            <CardTitle className="text-lg">{formatCurrency(avgDailySpend, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Savings Rate</CardDescription>
            <CardTitle className="text-lg">
              {income > 0 ? Math.round(((income - expense) / income) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}
