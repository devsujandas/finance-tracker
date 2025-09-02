import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SwRegister } from "@/components/pwa/sw-register"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "A mobile-first, PWA-ready finance tracker front end.",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <SwRegister />
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
