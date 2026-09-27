import Link from "next/link"
import { ArrowRight, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { EmptyState } from "@/components/brand/empty-state"
import { formatDate, formatGhs, type NetworkId } from "@/lib/data"

// Accepts real orders from the DB — no hardcoded mock list
interface DbOrder {
  id: number
  network: string
  volume: string
  recipient: string
  reference: string
  customerPrice: unknown
  status: string
  createdAt: unknown
}

export function RecentOrders({ orders }: { orders: DbOrder[] }) {
  const recent = orders.slice(0, 5)

  return (
    <Card className="card-shadow overflow-hidden">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>
          {recent.length > 0 ? `Your last ${recent.length} purchase${recent.length > 1 ? "s" : ""}` : "No orders yet"}
        </CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {recent.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Buy your first data bundle to see it here."
            className="border-0 shadow-none"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Order</TableHead>
                <TableHead className="hidden sm:table-cell">Recipient</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((o) => {
                const date = (o.createdAt as unknown as Date).toISOString()
                return (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <NetworkChip id={o.network as NetworkId} />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-semibold">
                            {o.network.toUpperCase()} {o.volume}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{o.reference}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{o.recipient}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status as "delivered" | "processing" | "pending" | "failed"} />
                    </TableCell>
                    <TableCell className="pr-6 text-right font-semibold tabular-nums">
                      {formatGhs(Number(o.customerPrice))}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
