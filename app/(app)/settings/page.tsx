"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CategoryManager } from "@/components/settings/category-manager"
import { useSettings } from "@/hooks/use-settings"
import { ImportExportSection } from "@/components/data/import-export"
import { SampleDataSection } from "@/components/data/sample-data"
import { resetAllData, loadSettings, saveSettings } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TriangleAlert, Loader2 } from "lucide-react"

const currencies = ["USD", "EUR", "GBP", "JPY", "INR"]
const locales = ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"]
const densities = ["comfortable", "compact"] as const
const weekStarts = ["monday", "sunday"] as const

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { settings, setSettings } = useSettings()
  const [mounted, setMounted] = useState(false)

  // ✅ prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  // Local form state
  const [currency, setCurrency] = useState("USD")
  const [locale, setLocale] = useState("en-US")
  const [startOfWeek, setStartOfWeek] = useState<"monday" | "sunday">("monday")
  const [startOfMonth, setStartOfMonth] = useState<number>(1)
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable")
  const [autoLockEnabled, setAutoLockEnabled] = useState(false)
  const [pin, setPin] = useState("")
  const [hideBalances, setHideBalances] = useState(false)
  const [enableChartDownloads, setEnableChartDownloads] = useState(false)

  // ✅ loader states
  const [isSaving, setIsSaving] = useState(false)
  const [isPrivacySaving, setIsPrivacySaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency ?? "USD")
      setLocale(settings.locale ?? "en-US")
      setStartOfWeek(settings.startOfWeek ?? "monday")
      setStartOfMonth(settings.startOfMonth ?? 1)
      setDensity(settings.density ?? "comfortable")
      const s = loadSettings()
      setAutoLockEnabled(!!(s as any)?.autoLockEnabled)
      setPin((s as any)?.pin ?? "")
      setHideBalances(!!(s as any)?.hideBalances)
      setEnableChartDownloads(!!(s as any)?.enableChartDownloads)
    }
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const merged = {
        ...(settings || {}),
        currency,
        locale,
        startOfWeek,
        startOfMonth: Math.max(1, Math.min(28, Number(startOfMonth) || 1)),
        density,
        theme: (theme as "light" | "dark" | "system") ?? "system",
        autoLockEnabled,
        pin: pin || undefined,
        hideBalances,
        enableChartDownloads,
      }
      saveSettings(merged)
      setSettings(merged as any)
      toast({ title: "Settings saved" })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrivacySave = async () => {
    setIsPrivacySaving(true)
    try {
      const merged = {
        ...(settings || {}),
        autoLockEnabled,
        pin: pin || undefined,
        hideBalances,
        enableChartDownloads,
      }
      saveSettings(merged)
      setSettings(merged as any)
      toast({ title: "Privacy settings saved" })
    } finally {
      setIsPrivacySaving(false)
    }
  }

  const onResetAll = () => {
    resetAllData()
    toast({ title: "All data cleared", description: "The app will reload with defaults." })
    window.location.reload()
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-pretty text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize preferences and categories</p>
      </header>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Appearance</h2>
          <div className="grid grid-cols-3 gap-2">
            {mounted &&
              (["light", "dark", "system"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTheme(opt)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                    resolvedTheme === opt ? "border-primary text-primary" : "hover:bg-muted",
                  )}
                  aria-pressed={resolvedTheme === opt}
                >
                  {opt}
                </button>
              ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Preferences</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Currency */}
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Locale */}
            <div className="grid gap-2">
              <Label htmlFor="locale">Locale</Label>
              <select
                id="locale"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                {locales.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Start of week */}
            <div className="grid gap-2">
              <Label htmlFor="start-of-week">Start of week</Label>
              <select
                id="start-of-week"
                className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(e.target.value as any)}
              >
                {weekStarts.map((w) => (
                  <option key={w} value={w} className="capitalize">
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Start of month */}
            <div className="grid gap-2">
              <Label htmlFor="start-of-month">Start of month (1–28)</Label>
              <Input
                id="start-of-month"
                type="number"
                min={1}
                max={28}
                value={startOfMonth}
                onChange={(e) => setStartOfMonth(Number.parseInt(e.target.value, 10))}
              />
            </div>

            {/* Density */}
            <div className="grid gap-2">
              <Label htmlFor="density">Density</Label>
              <select
                id="density"
                className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                value={density}
                onChange={(e) => setDensity(e.target.value as any)}
              >
                {densities.map((d) => (
                  <option key={d} value={d} className="capitalize">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Privacy &amp; Security</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoLockEnabled} onChange={(e) => setAutoLockEnabled(e.target.checked)} />
              Enable Auto-Lock (requires PIN to unlock on return)
            </label>
            <div className="grid gap-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                placeholder="Set a PIN (optional)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hideBalances} onChange={(e) => setHideBalances(e.target.checked)} />
              Hide balances and amounts (tap/click to reveal)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enableChartDownloads}
                onChange={(e) => setEnableChartDownloads(e.target.checked)}
              />
              Enable “Download PNG” on charts
            </label>
          </div>
          <div className="mt-4">
            <Button onClick={handlePrivacySave} disabled={isPrivacySaving} className="flex items-center gap-2">
              {isPrivacySaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Privacy"
              )}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Categories</h2>
          <CategoryManager />
        </div>

        {/* Data & Backup */}
        <div className="space-y-4">
          <h2 className="text-base font-medium">Data &amp; Backup</h2>
          <ImportExportSection />
          <SampleDataSection />
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium text-destructive">Danger Zone</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Remove all local data and restore the app to its default state. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset All Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-sm">
              <AlertDialogHeader>
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={32}
                    className="text-destructive h-[clamp(24px,5vw,40px)] w-[clamp(24px,5vw,40px)]"
                  />
                  <div>
                    <AlertDialogTitle className="text-pretty">Reset all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all data (settings, categories, accounts, transactions, and budgets).
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white" onClick={onResetAll}>
                    Reset All Data
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  )
}
