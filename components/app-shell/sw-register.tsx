"use client"

import { useEffect } from "react"

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    // In previews, reloads can occur frequently; guard against duplicate registrations
    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        // console.log("[v0] Service worker registered")
      } catch (err) {
        // console.log("[v0] Service worker registration error:", (err as Error).message)
      }
    }
    register()
  }, [])

  return null
}
