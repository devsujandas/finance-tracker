"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (pathname?.startsWith("/onboarding")) return
    try {
      const settings = window.localStorage.getItem("bt:settings")
      if (!settings) {
        router.replace("/onboarding")
      }
    } catch {
      // no-op
    }
  }, [pathname, router])

  return <>{children}</>
}
