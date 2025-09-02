"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { useMemo, useState } from "react"
import { loadSettings } from "@/lib/storage"

function KPICard({ label, value, hide }: { label: string; value: string; hide: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const hidden = hide && !revealed
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          hidden ? "mt-1 text-lg font-semibold blur-sm cursor-pointer select-none" : "mt-1 text-lg font-semibold"
        }
        onClick={() => hidden && setRevealed(true)}
        title={hidden ? "Click to reveal" : undefined}
        aria-label={hidden ? "Hidden amount, activate to reveal" : label}
        tabIndex={hidden ? 0 : -1}
        onKeyDown={(e) => {
          if (hidden && (e.key === "Enter" || e.key === " ")) setRevealed(true)
        }}
      >
        {hidden ? "••••" : value}
      </p>
    </div>
  )
}

export function KPIGrid() {
  const { kpis } = useDashboard()
  const hide = useMemo(() => !!loadSettings()?.hideBalances, [])
  return (
    <div className="grid grid-cols-2 gap-3">
      <KPICard label="Total Balance" value={kpis.totalBalance} hide={hide} />
      <KPICard label="This Month’s Income" value={kpis.incomeMonth} hide={hide} />
      <KPICard label="This Month’s Expense" value={kpis.expenseMonth} hide={hide} />
      <KPICard label="Savings Rate" value={kpis.savingsRate} hide={false} />
    </div>
  )
}
