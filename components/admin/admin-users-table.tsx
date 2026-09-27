"use client"

import { useState } from "react"
import { Search, User, ShieldCheck, Mail, Calendar, Wallet, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"

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

export function AdminUsersTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState("")

  const filtered = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or code..."
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
            No customers match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Wallet Balance</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spend</th>
                  <th className="px-4 py-3">Referral Code</th>
                  <th className="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const isOwner = String(u.email).toLowerCase() === "pboxtv9@gmail.com"
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {(u.name?.[0] || "U").toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">{u.name || "Customer"}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <ShieldCheck className="size-3" /> Owner
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
                      <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                        {u.referralCode || "—"}
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
