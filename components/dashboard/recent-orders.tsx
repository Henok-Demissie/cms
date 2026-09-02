import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, orders } from "@/lib/data"

export function RecentOrders() {
  const recent = orders.slice(0, 5)
  return (
    <section className="card-shadow rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="title-bar text-sm font-bold">Recent orders</h2>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:underline"
        >
          View all <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {recent.map((o) => (
          <li key={o.id} className="flex items-center gap-3 px-5 py-3">
            <NetworkChip id={o.network} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{o.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {o.phone} · {formatDate(o.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold">{formatGhs(o.amount)}</span>
              <StatusBadge status={o.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
