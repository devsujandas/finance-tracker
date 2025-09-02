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
import { TriangleAlert, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const MotionButton = motion(Button)

const currencies = ["USD", "EUR", "GBP", "JPY", "INR"]
const locales = ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"]
const densities = ["comfortable", "compact"] as const
const weekStarts = ["monday", "sunday"] as const

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { settings, setSettings } = useSettings()

  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [privacySaved, setPrivacySaved] = useState(false)

  // Local form state mirrored from SWR settings
  const [currency, setCurrency] = useState("USD")
  const [locale, setLocale] = useState("en-US")
  const [startOfWeek, setStartOfWeek] = useState<"monday" | "sunday">("monday")
  const [startOfMonth, setStartOfMonth] = useState<number>(1)
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable")
  const [autoLockEnabled, setAutoLockEnabled] = useState(false)
  const [pin, setPin] = useState("")
  const [hideBalances, setHideBalances] = useState(false)
  const [enableChartDownloads, setEnableChartDownloads] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency)
      setLocale(settings.locale)
      setStartOfWeek(settings.startOfWeek)
      setStartOfMonth(settings.startOfMonth)
      setDensity(settings.density)
      const s = loadSettings()
      setAutoLockEnabled(!!(s as any)?.autoLockEnabled)
      setPin((s as any)?.pin ?? "")
      setHideBalances(!!(s as any)?.hideBalances)
      setEnableChartDownloads(!!(s as any)?.enableChartDownloads)
    }
  }, [settings])

  const onSave = () => {
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
    } as any

    saveSettings(merged)
    setSettings(merged as any)
    toast({ title: "Settings saved" })

    // Animation trigger
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const onSavePrivacy = () => {
    const merged = {
      ...(settings || {}),
      autoLockEnabled,
      pin: pin || undefined,
      hideBalances,
      enableChartDownloads,
    } as any
    saveSettings(merged)
    setSettings(merged as any)
    toast({ title: "Privacy settings saved" })

    setPrivacySaved(true)
    setTimeout(() => setPrivacySaved(false), 1500)
  }

  const onResetAll = () => {
    resetAllData()
    toast({ title: "All data cleared", description: "The app will reload with defaults." })
    window.location.reload()
  }

  if (!mounted) {
    // Prevent hydration mismatch by rendering nothing until mounted
    return <div className="p-6 text-muted-foreground">Loading settings...</div>
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
            {(["light", "dark", "system"] as const).map((opt) => (
              <MotionButton
                key={opt}
                type="button"
                onClick={() => setTheme(opt)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  resolvedTheme === opt ? "border-primary text-primary" : "hover:bg-muted",
                )}
                aria-pressed={resolvedTheme === opt}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {opt}
              </MotionButton>
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

          {/* Save Button with feedback */}
          <div className="mt-4 flex items-center gap-2">
            <MotionButton whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }} onClick={onSave}>
              Save
            </MotionButton>
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-green-600 flex items-center gap-1 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.div>
              )}
            </AnimatePresence>
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

          <div className="mt-4 flex items-center gap-2">
            <MotionButton whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }} onClick={onSavePrivacy}>
              Save Privacy
            </MotionButton>
            <AnimatePresence>
              {privacySaved && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-green-600 flex items-center gap-1 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.div>
              )}
            </AnimatePresence>
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
              <MotionButton variant="destructive" whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}>
                Reset All Data
              </MotionButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-sm">
              <AlertDialogHeader>
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    className="text-destructive h-[clamp(28px,6vw,48px)] w-[clamp(28px,6vw,48px)]"
                  />
                  <div>
                    <AlertDialogTitle className="text-pretty">Reset all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all data (settings, categories, accounts, transactions, and
                      budgets). This action cannot be undone.
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <MotionButton variant="outline" whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}>
                    Cancel
                  </MotionButton>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <MotionButton
                    className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
                    onClick={onResetAll}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    Reset All Data
                  </MotionButton>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  )
}
