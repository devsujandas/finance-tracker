"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportAllData } from "@/lib/export"

export function QuickActions() {
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button onClick={() => router.push("/transactions")} variant="secondary">
        Add Transaction
      </Button>
      <Button onClick={() => router.push("/budgets")} variant="secondary">
        Add Budget
      </Button>
      <Button
        onClick={() => {
          exportAllData()
          toast({ title: "Export started", description: "Your data file is downloading." })
        }}
      >
        Export Data
      </Button>
    </div>
  )
}
