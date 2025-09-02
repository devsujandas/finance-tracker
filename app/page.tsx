"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

const data = [
  { name: "Mon", spend: 1200, budget: 1000 },
  { name: "Tue", spend: 800, budget: 900 },
  { name: "Wed", spend: 1400, budget: 1100 },
  { name: "Thu", spend: 1000, budget: 1000 },
  { name: "Fri", spend: 1600, budget: 1200 },
  { name: "Sat", spend: 900, budget: 950 },
  { name: "Sun", spend: 1300, budget: 1100 },
]

// ✅ Currency Symbol (Dynamic)
const currencySymbol = "" // Example: "$", "€", "£", "₹" etc.

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 px-4 py-3 shadow-lg text-left">
        <p className="text-sm font-medium text-zinc-200 mb-1">{label}</p>
        <p className="text-base font-bold text-teal-400">
          Spend: {currencySymbol}{payload[0].value.toLocaleString()}
        </p>
        <p className="text-base font-bold text-indigo-400">
          Budget: {currencySymbol}{payload[1].value.toLocaleString()}
        </p>
        <p
          className={`text-xs mt-1 ${
            payload[0].value > payload[1].value
              ? "text-red-400"
              : "text-green-400"
          }`}
        >
          {payload[0].value > payload[1].value
            ? `Overspent ${currencySymbol}${(payload[0].value - payload[1].value).toLocaleString()}`
            : `Saved ${currencySymbol}${(payload[1].value - payload[0].value).toLocaleString()}`}
        </p>
      </div>
    )
  }
  return null
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 text-center">
      {/* Header */}
<header className="mb-12">
  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
    {/* Mobile (default) */}
    <span className="block sm:hidden">
      Welcome to
      <br />
      <span className="text-teal-500">Finance Tracker</span>
    </span>

    {/* Desktop */}
    <span className="hidden sm:block">
      Welcome to <span className="text-teal-500">Finance Tracker</span>
    </span>
  </h1>

  <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
    Track expenses, set budgets, and gain insights into your financial habits — 
    all in one clean and modern dashboard.
  </p>
</header>


      {/* Live Graph Section */}
      <section className="mb-10">
        <div className="rounded-2xl border bg-card shadow-md p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-left">Spending Overview</h2>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer>
              <LineChart data={data}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#14b8a6", strokeWidth: 2, strokeDasharray: "4 2" }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="url(#spendGradient)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#14b8a6", strokeWidth: 3 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="url(#budgetGradient)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#6366f1", strokeWidth: 3 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="grid gap-4 sm:grid-cols-2 mb-6">
        <Link href="/dashboard">
          <Button size="lg" className="w-full rounded-xl shadow-md hover:scale-105 transition">
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/transactions">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-xl border-dashed hover:bg-muted/30 transition"
          >
            Review Transactions
          </Button>
        </Link>
      </section>

      {/* Secondary Link */}
      <div>
        <Link
          href="/analytics"
          className="text-sm font-medium text-teal-600 hover:underline hover:text-teal-700"
        >
          Explore Analytics →
        </Link>
      </div>
    </main>
  )
}
