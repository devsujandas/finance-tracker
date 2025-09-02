"use client"

import { useEffect } from "react"

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")
        // eslint-disable-next-line no-console
        console.log("[v0] Service worker registered:", reg.scope)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("[v0] Service worker registration failed:", (e as Error).message)
      }
    }

    register()
  }, [])

  return null
}
