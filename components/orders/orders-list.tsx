"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClipboardList, RefreshCw, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/brand/empty-state"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, formatTime, orders, type Order } from "@/lib/data"

const filters: { id: "all" | Order["type"]; label: string; icon?: typeof Zap }[] = [
  { id: "all", label: "All" },
  { id: "data", label: "Data" },
  { id: "express", label: "Express", icon: Zap },
  { id: "airtime", label: "Airtime" },
  { id: "bills", label: "Bills" },
  { id: "checkers", label: "Checkers" },
]

export function OrdersList() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all")
  const [q, setQ] = useState("")

  const list = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "all" || o.type === filter) &&
          (q === "" || [o.id, o.phone, o.label].some((s) => s.toLowerCase().includes(q.toLowerCase()))),
      ),
    [filter, q],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Order ID, phone, service..."
            aria-label="Search orders"
            className="h-11 rounded-xl bg-muted pl-10"
          />
        </div>
        <Button variant="outline" size="icon" className="size-11 rounded-xl" aria-label="Refresh orders">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div role="tablist" className="flex flex-wrap gap-1 rounded-2xl bg-muted p-1">
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="size-3.5 text-brand-emerald" aria-hidden />}
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Place your first order to see it here."
          action={
            <Button asChild className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
              <Link href="/dashboard/buy">Buy your first bundle</Link>
            </Button>
          }
        />
      ) : (
        <ul className="card-shadow divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <NetworkChip id={o.network} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{o.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{o.id}</span> · {o.phone}
                </p>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <p>{formatDate(o.createdAt)}</p>
                <p>{formatTime(o.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold">{formatGhs(o.amount)}</span>
                <StatusBadge status={o.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
