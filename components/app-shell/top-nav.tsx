"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, List, Wallet, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", Icon: List },
  { href: "/budgets", label: "Budgets", Icon: Wallet },
  { href: "/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/settings", label: "Settings", Icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/95 backdrop-blur md:block">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-semibold">
          Finance Tracker
          <span className="sr-only">Home</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1">
            {links.map(({ href, label, Icon }) => {
              const active = pathname?.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden lg:inline">{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
