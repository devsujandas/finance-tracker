"use client"

import useSWR from "swr"
import { loadAccounts, saveAccounts } from "@/lib/storage"
import type { Account } from "@/lib/types"

const KEY = "bt:accounts"

const DEFAULTS: Account[] = [
  { id: "cash", name: "Cash", type: "cash", openingBalance: 0 },
  { id: "bank1", name: "Bank-1", type: "bank", openingBalance: 0 },
  { id: "wallet", name: "Wallet", type: "wallet", openingBalance: 0 },
  { id: "card", name: "Card", type: "card", openingBalance: 0 },
]

export function useAccounts() {
  const { data, mutate } = useSWR<Account[]>(
    KEY,
    async () => {
      const existing = loadAccounts()
      if (existing.length === 0) {
        saveAccounts(DEFAULTS)
        return DEFAULTS
      }
      return existing
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const setAccounts = (next: Account[]) => {
    saveAccounts(next)
    mutate(next, false)
  }

  return { accounts: data ?? DEFAULTS, setAccounts }
}
