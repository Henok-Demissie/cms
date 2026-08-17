import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"
import { Bell, Search } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  return (
    <SidebarProvider>
      <AppSidebar role={session?.user?.role ?? "CUSTOMER"} userName={session?.user?.name} userEmail={session?.user?.email} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Search complaints...</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium">{session?.user?.name ?? "Your workspace"}</p>
              <p className="text-[10px] text-muted-foreground">{session?.user?.role === "CUSTOMER" ? "Customer portal" : "Staff workspace"}</p>
            </div>
          </div>
        </header>
        <main className="compact flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
