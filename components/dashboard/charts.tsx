"use client"

import type React from "react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { usePrefersReducedMotion } from "@/lib/a11y"
import { useDashboard } from "@/hooks/use-dashboard"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6b7280"]

export function TrendChart({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) {
  const reduced = usePrefersReducedMotion()
  const { trend } = useDashboard()
  if (trend.length === 0) {
    return <div className="h-24 rounded-md bg-muted" aria-hidden="true" />
  }
  return (
    <div ref={containerRef} className="h-48" aria-label="12-month income and expense trend">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            isAnimationActive={!reduced}
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            isAnimationActive={!reduced}
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryPie({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) {
  const reduced = usePrefersReducedMotion()
  const { categoryBreakdown } = useDashboard()
  if (categoryBreakdown.length === 0) {
    return <div className="h-24 rounded-md bg-muted" aria-hidden="true" />
  }
  return (
    <div ref={containerRef} className="h-48" aria-label="Expenses by category">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            isAnimationActive={!reduced}
            data={categoryBreakdown}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >
            {categoryBreakdown.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BudgetUsageBars({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) {
  const reduced = usePrefersReducedMotion()
  const { budgetUsage } = useDashboard()
  if (budgetUsage.length === 0) {
    return <div className="h-24 rounded-md bg-muted" aria-hidden="true" />
  }
  return (
    <div ref={containerRef} className="h-48" aria-label="Monthly spend versus budget">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={budgetUsage}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar isAnimationActive={!reduced} dataKey="spent" stackId="a" fill="#ef4444" />
          <Bar isAnimationActive={!reduced} dataKey="remaining" stackId="a" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
