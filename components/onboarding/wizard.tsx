"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { saveSettings, saveCategories } from "@/lib/storage"
import { defaultCategories, defaultSettings } from "@/data/defaults"
import type { AppSettings } from "@/lib/types"

const currencies = ["USD", "EUR", "GBP", "JPY", "INR"]

export function OnboardingWizard() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [currency, setCurrency] = useState<AppSettings["currency"]>("USD")
  const [startOfMonth, setStartOfMonth] = useState<number>(1)
  const [includeDefaults, setIncludeDefaults] = useState(true)

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const finish = (loadDemo = false) => {
    const settings: AppSettings = {
      ...defaultSettings,
      currency,
      startOfMonth: Math.max(1, Math.min(28, Number(startOfMonth) || 1)),
    }
    saveSettings(settings)
    saveCategories(includeDefaults ? defaultCategories : [])

    if (loadDemo) {
      try {
        localStorage.setItem("bt:demo", "true")
      } catch {}
    }

    toast({ title: "You're all set!", description: "You can change preferences anytime in Settings." })
    router.replace("/dashboard")
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-pretty text-2xl font-semibold">Welcome</h1>
        <p className="text-sm text-muted-foreground">Let’s set up your currency, start of month, and categories.</p>
      </header>

      {step === 1 && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Currency</h2>
          <div className="grid gap-2">
            <Label htmlFor="currency">Default currency</Label>
            <select
              id="currency"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div />
            <Button onClick={next}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Start of month</h2>
          <div className="grid gap-2">
            <Label htmlFor="startOfMonth">Billing start day (1–28)</Label>
            <Input
              id="startOfMonth"
              type="number"
              min={1}
              max={28}
              value={startOfMonth}
              onChange={(e) => setStartOfMonth(Number.parseInt(e.target.value, 10))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Next</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Categories</h2>
          <p className="text-sm text-muted-foreground">Use a starter set of categories? You can edit them later.</p>
          <div className="mt-3 grid gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeDefaults} onChange={(e) => setIncludeDefaults(e.target.checked)} />
              Include default categories
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button variant="outline" onClick={back}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => finish(true)}>
                Load demo data
              </Button>
              <Button onClick={() => finish(false)}>Finish</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
