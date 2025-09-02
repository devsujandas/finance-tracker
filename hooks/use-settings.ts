"use client"

import useSWR from "swr"
import { loadSettings, saveSettings } from "@/lib/storage"
import type { AppSettings } from "@/lib/types"

const KEY = "bt:settings"

export function useSettings() {
  const { data, mutate } = useSWR<AppSettings | null>(KEY, async () => loadSettings(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const setSettings = (next: AppSettings) => {
    saveSettings(next)
    mutate(next, false)
  }

  return { settings: data ?? null, setSettings }
}
