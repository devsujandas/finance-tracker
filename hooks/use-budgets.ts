"use client"

import useSWR from "swr"
import { loadBudgets, saveBudgets } from "@/lib/storage"
import type { Budget } from "@/lib/types"

const KEY = "bt:budgets"

export function useBudgets() {
  const { data, mutate } = useSWR<Budget[]>(
    KEY,
    async () => {
      const items = loadBudgets()
      return items
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const budgets = data ?? []

  const persist = (next: Budget[]) => {
    saveBudgets(next)
    mutate(next, false)
  }

  const add = (b: Budget) => persist([b, ...budgets])
  const update = (b: Budget) => persist(budgets.map((x) => (x.id === b.id ? b : x)))
  const remove = (id: string) => persist(budgets.filter((x) => x.id !== id))

  return { budgets, add, update, remove }
}
