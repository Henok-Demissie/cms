import type React from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { AppTopbar } from "@/components/shell/app-topbar"
import { WhatsAppFloat } from "@/components/shell/whatsapp-float"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { isOwnerEmail } from "@/lib/owner"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  // If there is no valid session, force the user to sign in — no auto-login bypass
  if (!session?.user) redirect("/sign-in")

  const isOwner = isOwnerEmail(session.user.email)

  return (
    <SidebarProvider>
      <AppSidebar isOwner={isOwner} />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </SidebarInset>
      <WhatsAppFloat />
    </SidebarProvider>
  )
}
