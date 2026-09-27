import type React from "react"
import { requireAdminOrOwner } from "@/lib/owner"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, isOwner } = await requireAdminOrOwner()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminNav isOwner={isOwner} userEmail={session.user.email} />
      <main className="flex-1 px-4 py-8 sm:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
