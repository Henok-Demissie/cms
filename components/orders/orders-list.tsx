"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClipboardList, Download, RefreshCw, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/brand/empty-state"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, formatTime, orders, type Order } from "@/lib/data"

type Filter = "all" | Order["type"]

const filters: { id: Filter; label: string; icon?: typeof Zap }[] = [
  { id: "all", label: "All" },
  { id: "data", label: "Data" },
  { id: "express", label: "Express", icon: Zap },
  { id: "airtime", label: "Airtime" },
  { id: "bills", label: "Bills" },
  { id: "checkers", label: "Checkers" },
]

export function OrdersList() {
  const [filter, setFilter] = useState<Filter>("all")
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="min-w-0">
          <TabsList className="w-full justify-start overflow-x-auto md:w-fit">
            {filters.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id}>
                {Icon && <Icon className="text-brand-emerald" />}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <InputGroup className="md:w-72">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order ID, phone, service"
              aria-label="Search orders"
            />
          </InputGroup>
          <Button variant="outline" size="icon" aria-label="Refresh orders">
            <RefreshCw />
          </Button>
          <Button variant="outline" size="icon" aria-label="Export orders" className="hidden sm:inline-flex">
            <Download />
          </Button>
        </div>
      </div>

      <Card className="card-shadow overflow-hidden py-0">
        <CardContent className="px-0">
          {list.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No orders found"
              description={q ? "Try a different search term or filter." : "Place your first order to see it here."}
              action={
                <Button asChild className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
                  <Link href="/dashboard/buy">Buy your first bundle</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead className="hidden sm:table-cell">Recipient</TableHead>
                  <TableHead className="hidden md:table-cell">Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden pr-6 text-right sm:table-cell">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <NetworkChip id={o.network} />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-semibold">{o.label}</span>
                          <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{o.phone}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {list.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {list.length} of {orders.length} orders
        </p>
      )}
    </div>
  )
}
