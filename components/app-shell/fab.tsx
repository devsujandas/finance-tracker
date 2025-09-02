"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddTransactionFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-12 w-12 rounded-full p-0 shadow-lg"
            aria-label="Add transaction"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Description"
              className="w-full rounded-md border px-3 py-2"
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full rounded-md border px-3 py-2"
            />
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
