"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AddTransactionFab() {
  const { toast } = useToast()

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center md:hidden">
      <Button
        onClick={() =>
          toast({
            title: "Add Transaction",
            description: "The add transaction flow will appear here soon.",
          })
        }
        className="h-12 w-12 rounded-full p-0 shadow-lg"
        aria-label="Add transaction"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  )
}
