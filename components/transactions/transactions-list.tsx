"use client"

import { useMemo, useState } from "react"
import { ArrowDownToLine, Gift, Receipt, RotateCcw, Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/brand/empty-state"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, formatTime, transactions, type Transaction } from "@/lib/data"

const filters: { id: "all" | Transaction["kind"]; label: string; icon: typeof Receipt }[] = [
  { id: "all", label: "All", icon: Receipt },
  { id: "order", label: "Orders", icon: ShoppingCart },
  { id: "topup", label: "Top-ups", icon: ArrowDownToLine },
]

const kindIcon: Record<Transaction["kind"], typeof Receipt> = {
  order: ShoppingCart,
  topup: ArrowDownToLine,
  refund: RotateCcw,
  referral: Gift,
}

export function TransactionsList() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all")
  const [q, setQ] = useState("")

  const list = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (filter === "all" || t.kind === filter) &&
          (q === "" || [t.reference, t.label].some((s) => s.toLowerCase().includes(q.toLowerCase()))),
      ),
    [filter, q],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex gap-2">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === id ? "brand-gradient brand-glow text-brand-deep" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference, order ID"
            aria-label="Search transactions"
            className="h-11 rounded-xl bg-muted pl-10"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions found" description="New transactions will appear here." />
      ) : (
        <ul className="card-shadow divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((t) => {
            const Icon = kindIcon[t.kind]
            const credit = t.amount > 0
            return (
              <li key={t.id} className="flex items-center gap-3 px-5 py-4">
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${
                    credit ? "bg-success/10 text-brand-emerald" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{t.reference}</span> · {formatDate(t.createdAt)} {formatTime(t.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm font-bold ${credit ? "text-brand-emerald" : ""}`}>
                    {credit ? "+" : "−"}
                    {formatGhs(t.amount)}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
