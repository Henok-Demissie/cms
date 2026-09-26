import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _manrope = Manrope({ subsets: ["latin"] })
const _jetbrains = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DataSpots — Buy Data. Save More.",
  description:
    "DataSpots is Ghana's fastest data marketplace. Buy MTN, Telecel and AirtelTigo bundles, airtime and result checkers instantly, with a wallet, referrals, and a developer API.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#141816" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
