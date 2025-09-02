import type { ReactNode } from "react"
import { BottomNav } from "@/components/app-shell/bottom-nav"
import { AddTransactionFab } from "@/components/app-shell/fab"
import { OnboardingGate } from "@/components/app-shell/onboarding-gate"
import { TopNav } from "@/components/app-shell/top-nav"
import { LockGate } from "@/components/app-shell/lock-gate"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OnboardingGate>
        <LockGate />
        <div className="flex min-h-svh flex-col">
          {/* Desktop navbar */}
          <TopNav />
          {/* Add top padding on md+ so content doesn’t sit under the sticky TopNav */}
          <main className="flex-1 pb-24 md:pt-12">{children}</main>
          <BottomNav />
        </div>
      </OnboardingGate>
      <AddTransactionFab />
    </>
  )
}
