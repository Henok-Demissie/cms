import type React from "react"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { AppTopbar } from "@/components/shell/app-topbar"
import { WhatsAppFloat } from "@/components/shell/whatsapp-float"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppTopbar />
      <div className="flex flex-1">
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] lg:block">
          <AppSidebar />
        </div>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
      <WhatsAppFloat />
    </div>
  )
}
