"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClipboardList, RefreshCw, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/brand/empty-state"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, formatTime, type NetworkId } from "@/lib/data"
import { syncOrderStatus } from "@/app/actions/orders"

export interface LiveOrder {
  id: number
  network: NetworkId
  volume: string
  recipient: string
  reference: string
  amount: number
  status: "pending" | "processing" | "delivered" | "failed"
  createdAt: string
}

export function LiveOrders({ orders }: { orders: LiveOrder[] }) {
  const router = useRouter()
  const [syncingId, setSyncingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  // Auto-revalidate immediately whenever any order is pending or processing
  const hasInFlight = orders.some((o) => o.status === "processing" || o.status === "pending")
  useEffect(() => {
    if (!hasInFlight) return
    const timer = setInterval(() => {
      router.refresh()
    }, 3500)
    return () => clearInterval(timer)
  }, [hasInFlight, router])

  const downloadCSV = () => {
    if (orders.length === 0) {
      toast.error("No orders to download")
      return
    }

    const headers = ["Order ID", "Service", "Recipient", "Amount (GH₵)", "Status", "Date"]
    const rows = orders.map((o) => [
      o.reference || `#${o.id}`,
      `${o.network.toUpperCase()} ${o.volume}`,
      o.recipient,
      formatGhs(o.amount).replace("GHS ", ""),
      o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : "",
      o.createdAt,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = String(val ?? "").replace(/"/g, '""')
            return `"${str}"`
          })
          .join(",")
      ),
    ]

    const blob = new Blob([csvContent.join("\r\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `my_orders_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${orders.length} orders`)
  }

  const sync = (id: number) => {
    setSyncingId(id)
    startTransition(async () => {
      const res = await syncOrderStatus(id)
      setSyncingId(null)
      if (res.ok) {
        const label =
          res.status === "delivered" ? "Delivered ✓" :
          res.status === "failed" ? "Failed – you were refunded" :
          res.status === "processing" ? "Still processing…" :
          res.status ?? "Updated"
        toast.success(`Status: ${label}`)
        router.refresh()
      } else {
        toast.error("Could not refresh status right now.")
        // Still refresh the page — the DB might have the correct status already.
        router.refresh()
      }
    })
  }

  if (orders.length === 0) {
    return (
      <Card className="card-shadow overflow-hidden py-0">
        <CardContent className="px-0">
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
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          onClick={downloadCSV}
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
        >
          <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Download CSV
        </Button>
      </div>
      <Card className="card-shadow overflow-hidden py-0">
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Order</TableHead>
              <TableHead className="hidden sm:table-cell">Recipient</TableHead>
              <TableHead className="hidden md:table-cell">Placed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden pr-6 text-right sm:table-cell">Amount</TableHead>
              <TableHead className="pr-6 text-right">Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <NetworkChip id={o.network} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold">
                        {o.network.toUpperCase()} {o.volume}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{o.reference}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{o.recipient}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col text-muted-foreground">
                    <span>{formatDate(o.createdAt)}</span>
                    <span className="text-xs">{formatTime(o.createdAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={o.status} />
                    <span className="text-xs font-semibold tabular-nums sm:hidden">{formatGhs(o.amount)}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden pr-6 text-right font-semibold tabular-nums sm:table-cell">
                  {formatGhs(o.amount)}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Refresh status"
                    disabled={syncingId === o.id || o.status === "delivered"}
                    onClick={() => sync(o.id)}
                  >
                    <RefreshCw className={syncingId === o.id ? "animate-spin" : ""} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}
