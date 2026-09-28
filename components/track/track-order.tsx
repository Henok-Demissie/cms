"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Circle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { trackOrder } from "@/app/actions/orders"
import { orders as mockOrders } from "@/lib/data"

type DBOrder = Awaited<ReturnType<typeof trackOrder>>
type SingleOrder = NonNullable<DBOrder>[number]

const stages = ["Order placed", "Payment confirmed", "Sent to network", "Delivered"]
const stageIndex: Record<string, number> = {
  pending: 1,
  processing: 2,
  delivered: 4,
  failed: 2,
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}
function formatGhs(v: number | string) {
  return `GHS ${Math.abs(Number(v)).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function OrderCard({ order }: { order: SingleOrder }) {
  const idx = stageIndex[order.status] ?? 1
  return (
    <section className="card-shadow rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <NetworkChip id={order.network as any} />
        <div className="flex-1">
          <p className="text-sm font-bold">
            {order.network.toUpperCase()} {order.volume}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{order.reference}</span> · {order.recipient} · {formatDate(order.createdAt)}{" "}
            {formatTime(order.createdAt)}
          </p>
        </div>
        <span className="text-base font-extrabold">{formatGhs(order.customerPrice)}</span>
        <StatusBadge status={order.status as any} />
      </div>
      <ol className="mt-6 flex flex-col gap-0">
        {stages.map((s, i) => {
          const reached = i < idx
          const failedHere = order.status === "failed" && i === idx
          return (
            <li key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                {reached ? (
                  <CheckCircle2 className="size-5 text-brand-emerald" aria-hidden />
                ) : (
                  <Circle className={`size-5 ${failedHere ? "text-destructive" : "text-border"}`} aria-hidden />
                )}
                {i < stages.length - 1 && (
                  <span className={`my-1 h-6 w-px ${reached ? "bg-brand-green" : "bg-border"}`} aria-hidden />
                )}
              </div>
              <p className={`text-sm ${reached ? "font-semibold" : "text-muted-foreground"}`}>
                {failedHere ? "Failed at network — refund issued" : s}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function TrackOrder() {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SingleOrder[] | null | undefined>(undefined)
  const [isPending, startTransition] = useTransition()

  const search = () => {
    const key = q.trim()
    if (!key) return
    startTransition(async () => {
      const found = await trackOrder(key)
      setResults(found)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          search()
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. DS-7F3K2Q or 024 555 0198"
            aria-label="Order ID or phone"
            className="h-12 rounded-xl bg-muted pl-10 font-mono"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="brand-gradient brand-glow h-12 px-6 font-bold text-brand-deep hover:opacity-90"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Track"}
        </Button>
      </form>

      {results === null && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No order found. Check the ID and try again.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: try{" "}
        <button
          type="button"
          onClick={() => setQ(mockOrders[0].id)}
          className="font-mono font-semibold text-brand-emerald hover:underline"
        >
          {mockOrders[0].id}
        </button>
      </p>
    </div>
  )
}
