import type { ReactNode } from "react"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <main className="compact flex flex-1 flex-col">{children}</main>
    </div>
  )
}
