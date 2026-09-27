"use client"

import { useState } from "react"
import { Search, ShieldCheck, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"

function formatGHS(amount: number) {
  return `GHS ${Number(amount || 0).toFixed(2)}`
}

function formatDate(date: string | Date | undefined) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function AdminUsersTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState("")

  const filtered = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col gap-5">
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
