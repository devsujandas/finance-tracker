import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-3xl font-semibold">Welcome to Finance Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your spending, set budgets, and understand your money with clear analytics.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        <Link href="/dashboard">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
        <Link href="/transactions">
          <Button variant="outline" className="w-full bg-transparent">
            Review Transactions
          </Button>
        </Link>
        <Link href="/analytics" className="text-center text-sm text-muted-foreground hover:underline">
          Explore Analytics →
        </Link>
      </div>
    </main>
  )
}
