"use client"

import { useEffect, useMemo, useState } from "react"
import { loadSettings, getLockState, setLockState } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LockGate() {
  const [locked, setLocked] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const settings = useMemo(() => loadSettings(), [])

  useEffect(() => {
    setLocked(getLockState())
    // if auto-lock enabled, lock on hide/background
    if (!settings?.autoLockEnabled) return
    const handleHide = () => {
      setLockState(true)
      setLocked(true)
    }
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") handleHide()
    }
    window.addEventListener("pagehide", handleHide)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("pagehide", handleHide)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [settings?.autoLockEnabled])

  const unlock = () => {
    const s = loadSettings()
    const required = s?.pin
    if (s?.autoLockEnabled && required && pinInput !== required) {
      alert("Incorrect PIN")
      return
    }
    setLockState(false)
    setLocked(false)
    setPinInput("")
  }

  if (!locked) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
    >
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle className="text-center">Unlock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {settings?.pin ? "Enter your PIN to continue" : "No PIN set. You can set a PIN in Settings."}
          </p>
          <Input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN"
            aria-label="PIN"
            className="text-center"
          />
          <Button className="w-full" onClick={unlock}>
            Unlock
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
