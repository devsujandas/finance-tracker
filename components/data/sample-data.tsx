"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadSampleData } from "@/lib/io"

export function SampleDataSection() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-base font-semibold">Sample Data</h3>
      <p className="text-sm text-muted-foreground">
        Load realistic demo data (settings, categories, accounts, transactions, budgets). This will replace current
        data.
      </p>
      <div className="mt-3">
        <Button
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            try {
              loadSampleData()
              window.location.reload()
            } finally {
              setLoading(false)
            }
          }}
        >
          {loading ? "Loading…" : "Load Sample Data"}
        </Button>
      </div>
    </div>
  )
}
