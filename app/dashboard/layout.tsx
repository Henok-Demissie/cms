import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { BackButton } from "@/components/back-button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="md:hidden" />
          <BackButton fallbackHref="/dashboard" />
        </header>
        <main className="compact flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
