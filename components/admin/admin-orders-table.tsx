"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

function formatGHS(amount: number) {
  return `GHS ${Number(amount || 0).toFixed(2)}`
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AdminOrdersTable({ orders }: { orders: any[] }) {
  const [search, setSearch] = useState("")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  // Auto-revalidate immediately whenever any order is pending or processing
  const hasInFlight = orders.some((o) => o.status === "processing" || o.status === "pending")
  useEffect(() => {
    if (!hasInFlight) return
    const timer = setInterval(() => {
      router.refresh()
    }, 4000)
    return () => clearInterval(timer)
  }, [hasInFlight, router])

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase()
    const matchesSearch =
      (o.recipient && o.recipient.toLowerCase().includes(term)) ||
      (o.reference && o.reference.toLowerCase().includes(term)) ||
      (o.user_name && o.user_name.toLowerCase().includes(term)) ||
      (o.user_email && o.user_email.toLowerCase().includes(term))

    const matchesNetwork =
      networkFilter === "all" ||
      (o.network && o.network.toLowerCase() === networkFilter.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (o.status && o.status.toLowerCase() === statusFilter.toLowerCase())

    return matchesSearch && matchesNetwork && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search phone, reference, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Network Filter */}
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Networks</option>
            <option value="mtn">MTN</option>
            <option value="telecel">Telecel</option>
            <option value="airteltigo">AirtelTigo</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {orders.length} orders
      </p>

      {/* Orders Table */}
      <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Retail Price</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Net Profit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => {
                  const profit = Number(order.customerPrice || 0) - Number(order.costPrice || 0)
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">
                        {order.reference || `#${order.id}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{order.user_name || "Customer"}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{order.user_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-foreground">{order.network}</span>{" "}
                        <span>{order.volume}</span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {order.recipient}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatGHS(order.customerPrice)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatGHS(order.costPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          +{formatGHS(profit)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === "delivered" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="size-3" /> Delivered
                          </span>
                        ) : order.status === "processing" || order.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            <Clock className="size-3" /> Processing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                            <XCircle className="size-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
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
