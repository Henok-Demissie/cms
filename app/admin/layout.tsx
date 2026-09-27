import type React from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isOwnerEmail } from "@/lib/owner"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/sign-in")
  }

  if (!isOwnerEmail(session.user.email)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminNav />
      <main className="flex-1 px-4 py-8 sm:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
