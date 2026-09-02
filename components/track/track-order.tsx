"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, formatTime, orders, type Order } from "@/lib/data"

const stages = ["Order placed", "Payment confirmed", "Sent to network", "Delivered"]
const stageIndex: Record<Order["status"], number> = { pending: 1, processing: 2, delivered: 4, failed: 2 }

export function TrackOrder() {
  const [q, setQ] = useState("")
  const [result, setResult] = useState<Order | null | undefined>(undefined)

  const search = () => {
    const key = q.trim().toLowerCase().replace(/\s/g, "")
    if (!key) return
    const found = orders.find(
      (o) => o.id.toLowerCase() === key || o.phone.replace(/\s/g, "") === key,
    )
    setResult(found ?? null)
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
        <Button type="submit" className="brand-gradient brand-glow h-12 px-6 font-bold text-brand-deep hover:opacity-90">
          Track
        </Button>
      </form>

      {result === null && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No order found. Check the ID and try again.
        </p>
      )}

      {result && (
        <section className="card-shadow rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <NetworkChip id={result.network} />
            <div className="flex-1">
              <p className="text-sm font-bold">{result.label}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{result.id}</span> · {result.phone} · {formatDate(result.createdAt)} {formatTime(result.createdAt)}
              </p>
            </div>
            <span className="text-base font-extrabold">{formatGhs(result.amount)}</span>
            <StatusBadge status={result.status} />
          </div>
          <ol className="mt-6 flex flex-col gap-0">
            {stages.map((s, i) => {
              const reached = i < stageIndex[result.status]
              const failedHere = result.status === "failed" && i === stageIndex[result.status]
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
      )}

      <p className="text-xs text-muted-foreground">
        Tip: try <button type="button" onClick={() => setQ(orders[0].id)} className="font-mono font-semibold text-brand-emerald hover:underline">{orders[0].id}</button>
      </p>
    </div>
  )
}
