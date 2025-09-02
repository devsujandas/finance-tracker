"use client"

import type React from "react"

import { useRef, useMemo } from "react"
import { MonthSwitcher } from "./month-switcher"
import { KPIGrid } from "./kpis"
import { TrendChart, CategoryPie, BudgetUsageBars } from "./charts"
import { QuickActions } from "./quick-actions"
import { ChartExport } from "@/components/charts/chart-export"
import { useDashboard } from "@/hooks/use-dashboard"

export function DashboardView() {
  const trendRef = useRef<HTMLDivElement>(null)
  const pieRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)

  const { trend, categoryBreakdown, budgetUsage } = useDashboard()

  const trendCsv = useMemo(
    () => ({
      filename: "trend.csv",
      headers: ["Month", "Income", "Expense"],
      rows: trend.map((p) => [p.label, p.income, p.expense]),
    }),
    [trend],
  )
  const pieCsv = useMemo(
    () => ({
      filename: "category-breakdown.csv",
      headers: ["Category", "Amount"],
      rows: categoryBreakdown.map((p) => [p.name, p.value]),
    }),
    [categoryBreakdown],
  )
  const barsCsv = useMemo(
    () => ({
      filename: "budget-usage.csv",
      headers: ["Budget", "Spent", "Remaining"],
      rows: budgetUsage.map((p) => [p.name, p.spent, p.remaining]),
    }),
    [budgetUsage],
  )

  const getSvgFromRef = (ref: React.RefObject<HTMLDivElement>) => () =>
    (ref.current?.querySelector("svg") as SVGSVGElement | null) ?? null

  return (
    <section className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-pretty text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your finances</p>
      </header>

      <MonthSwitcher />

      <div className="mt-4">
        <KPIGrid />
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">12‑month trend</p>
            <ChartExport getSvg={getSvgFromRef(trendRef)} csv={trendCsv} filenameBase="trend" />
          </div>
          <TrendChart containerRef={trendRef} />
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Category breakdown</p>
            <ChartExport getSvg={getSvgFromRef(pieRef)} csv={pieCsv} filenameBase="category-breakdown" />
          </div>
          <CategoryPie containerRef={pieRef} />
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Monthly spend vs budget</p>
            <ChartExport getSvg={getSvgFromRef(barsRef)} csv={barsCsv} filenameBase="budget-usage" />
          </div>
          <BudgetUsageBars containerRef={barsRef} />
        </div>
      </div>

      <div className="mt-6">
        <QuickActions />
      </div>
    </section>
  )
}
