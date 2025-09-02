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

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="supports-[padding:max(0px,env(safe-area-inset-bottom))]:pb-[max(0px,env(safe-area-inset-bottom))] fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5 items-end justify-center">
        {links.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px]">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
