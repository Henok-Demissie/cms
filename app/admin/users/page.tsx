import Link from "next/link"
import { getAllAdminUsers, requireAdminOrOwner } from "@/lib/owner"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminUsersPage() {
  const { isOwner } = await requireAdminOrOwner()
  const users = await getAllAdminUsers()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
              <Link href="/admin">
                <ArrowLeft className="size-3 mr-1" />
                Back to Overview
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customer Accounts & Roles</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full directory of all registered customers, wallet balances, and administrator access management.
          </p>
        </div>
      </div>

      <AdminUsersTable users={users} isOwner={isOwner} />
    </div>
  )
}
