"use client"

import useSWR from "swr"
import { loadTransactions, saveTransactions } from "@/lib/storage"
import type { Transaction } from "@/lib/types"

const KEY = "bt:transactions"

export function useTransactions() {
  const { data, mutate } = useSWR<Transaction[]>(KEY, async () => loadTransactions(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const txns = data ?? []

  const persist = (next: Transaction[]) => {
    saveTransactions(next)
    mutate(next, false)
  }

  const add = (t: Transaction) => persist([t, ...txns])
  const update = (t: Transaction) => persist(txns.map((x) => (x.id === t.id ? t : x)))
  const remove = (id: string) => persist(txns.filter((x) => x.id !== id))
  const removeMany = (ids: string[]) => persist(txns.filter((x) => !ids.includes(x.id)))
  const replaceAll = (next: Transaction[]) => persist(next)

  return { txns, add, update, remove, removeMany, replaceAll }
}
