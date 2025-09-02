"use client"

// Prefers reduced motion hook to disable chart animations when requested by user
import { useEffect, useState } from "react"

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener?.("change", onChange)
    return () => mql.removeEventListener?.("change", onChange)
  }, [])
  return reduced
}
