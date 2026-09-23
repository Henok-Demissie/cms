import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NetworkChip } from "@/components/brand/network-chip"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDate, formatGhs, orders } from "@/lib/data"

export function RecentOrders() {
  const recent = orders.slice(0, 5)
  return (
    <Card className="card-shadow overflow-hidden">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Your last {recent.length} purchases</CardDescription>
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
            {recent.map((o) => (
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
                <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(o.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="pr-6 text-right font-semibold tabular-nums">{formatGhs(o.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
