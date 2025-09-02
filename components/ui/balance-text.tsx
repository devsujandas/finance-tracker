"use client"

import { useMemo, useState } from "react"
import { loadSettings } from "@/lib/storage"
import { formatCurrency } from "@/lib/number"
import { cn } from "@/lib/utils"

export function BalanceText({
  amount,
  className,
  "aria-label": ariaLabel,
}: {
  amount: number
  className?: string
  "aria-label"?: string
}) {
  const settings = useMemo(() => loadSettings(), [])
  const [revealed, setRevealed] = useState(false)
  const hidden = settings?.hideBalances && !revealed

  return (
    <span
      role={hidden ? "button" : undefined}
      tabIndex={hidden ? 0 : -1}
      aria-label={ariaLabel || (hidden ? "Hidden amount, activate to reveal" : "Amount")}
      onClick={() => hidden && setRevealed(true)}
      onKeyDown={(e) => {
        if (hidden && (e.key === "Enter" || e.key === " ")) setRevealed(true)
      }}
      className={cn(hidden ? "blur-sm cursor-pointer select-none" : "", className)}
      data-amount-hidden={hidden ? "true" : "false"}
      title={hidden ? "Click to reveal" : undefined}
    >
      {hidden ? "••••" : formatCurrency(amount)}
    </span>
  )
}
