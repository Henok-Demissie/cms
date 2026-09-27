"use client"

import { useState, useTransition } from "react"
import {
  Search,
  ShieldCheck,
  Crown,
  UserPlus,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  grantAdminAction,
  grantAdminByEmailAction,
  revokeAdminAction,
} from "@/app/actions/owner"

function formatGHS(amount: number) {
  return `GHS ${Number(amount || 0).toFixed(2)}`
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function AdminUsersTable({
  users,
  isOwner,
}: {
  users: any[]
  isOwner: boolean
}) {
  const [search, setSearch] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    )
  })

  const handleAddAdminByEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail.trim()) return
    setFeedback(null)

    startTransition(async () => {
      const res = await grantAdminByEmailAction(newAdminEmail.trim())
      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Admin appointed successfully!" })
        setNewAdminEmail("")
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to appoint admin." })
      }
    })
  }

  const handleMakeAdmin = (user: any) => {
    if (!confirm(`Are you sure you want to promote ${user.name || user.email} to Administrator?`)) return
    setFeedback(null)

    startTransition(async () => {
      const res = await grantAdminAction(user.id)
      if (res.success) {
        setFeedback({ type: "success", text: `Granted admin privileges to ${user.email}.` })
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to grant admin privileges." })
      }
    })
  }

  const handleRevokeAdmin = (user: any) => {
    if (String(user.email).toLowerCase() === "pboxtv9@gmail.com") {
      alert("Pboxtv9@gmail.com is the permanent primary owner and cannot be revoked.")
      return
    }

    if (!confirm(`Revoke admin privileges from ${user.name || user.email}?`)) return
    setFeedback(null)

    startTransition(async () => {
      const res = await revokeAdminAction(user.id)
      if (res.success) {
        setFeedback({ type: "success", text: `Revoked admin privileges from ${user.email}.` })
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to revoke admin privileges." })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Owner-Only: Quick Add Admin Panel */}
      {isOwner && (
        <div className="card-shadow rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Crown className="size-4" />
                <span>Owner Controls: Appoint New Administrator</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                As the primary owner, you can appoint registered customers as platform admins to manage orders and monitor activity.
              </p>
            </div>

            <form onSubmit={handleAddAdminByEmail} className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="customer@gmail.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={isPending}
                className="h-10 text-xs sm:w-64"
                required
              />
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="brand-gradient brand-glow shrink-0 font-bold text-brand-deep"
              >
                <UserPlus className="size-3.5 mr-1.5" />
                {isPending ? "Adding..." : "Add Admin"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {users.length} accounts
        </p>
      </div>

      {/* Users Table */}
      <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No accounts match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">System Role</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spend</th>
                  <th className="px-4 py-3">Joined Date</th>
                  {isOwner && <th className="px-4 py-3 text-right">Role Management</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const isPrimaryOwner = String(u.email).toLowerCase() === "pboxtv9@gmail.com"
                  const isAdmin = u.role === "admin"

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex size-8 items-center justify-center rounded-full font-bold ${
                              isPrimaryOwner
                                ? "bg-amber-500/20 text-amber-500"
                                : isAdmin
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {(u.name?.[0] || "U").toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{u.name || "Customer"}</span>
                              {isPrimaryOwner && (
                                <Crown className="size-3.5 text-amber-500" title="Primary Owner" />
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {isPrimaryOwner ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Crown className="size-3 text-amber-500" /> Primary Owner
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            <ShieldCheck className="size-3 text-blue-500" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Customer
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold text-emerald-500">
                        {formatGHS(u.balance)}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {u.order_count || 0}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {formatGHS(u.total_spend)}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Owner-Only Actions Column */}
                      {isOwner && (
                        <td className="px-4 py-3 text-right">
                          {isPrimaryOwner ? (
                            <span className="text-[10px] font-medium text-muted-foreground italic">
                              Permanent (Cannot be revoked)
                            </span>
                          ) : isAdmin ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleRevokeAdmin(u)}
                              className="h-7 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                            >
                              <UserX className="size-3 mr-1" />
                              Remove Admin
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleMakeAdmin(u)}
                              className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                            >
                              <UserCheck className="size-3 mr-1" />
                              Make Admin
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
