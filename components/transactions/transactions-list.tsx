"use client"

import { useMemo, useState } from "react"
import { ArrowDownToLine, Gift, Receipt, RotateCcw, Search, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/brand/empty-state"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import { formatDate, formatGhs, formatTime, transactions, type Transaction } from "@/lib/data"

type Filter = "all" | Transaction["kind"]

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "order", label: "Orders" },
  { id: "topup", label: "Top-ups" },
  { id: "refund", label: "Refunds" },
  { id: "referral", label: "Referrals" },
]

const kindIcon: Record<Transaction["kind"], typeof Receipt> = {
  order: ShoppingCart,
  topup: ArrowDownToLine,
  refund: RotateCcw,
  referral: Gift,
}

export function TransactionsList() {
  const [filter, setFilter] = useState<Filter>("all")
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="min-w-0">
          <TabsList className="w-full justify-start overflow-x-auto md:w-fit">
            {filters.map(({ id, label }) => (
              <TabsTrigger key={id} value={id}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="md:w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference or description"
            aria-label="Search transactions"
          />
        </InputGroup>
      </div>

      <Card className="card-shadow overflow-hidden py-0">
        <CardContent className="px-0">
          {list.length === 0 ? (
            <EmptyState icon={Receipt} title="No transactions found" description="New transactions will appear here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Reference</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden pr-6 text-right sm:table-cell">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((t) => {
                  const Icon = kindIcon[t.kind]
                  const credit = t.amount > 0
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg",
                              credit ? "bg-success/10 text-brand-emerald" : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span className="truncate font-semibold">{t.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        {t.reference}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col text-muted-foreground">
                          <span>{formatDate(t.createdAt)}</span>
                          <span className="text-xs">{formatTime(t.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={t.status} />
                          <span className={cn("text-xs font-semibold tabular-nums sm:hidden", credit && "text-brand-emerald")}>
                            {credit ? "+" : "−"}
                            {formatGhs(Math.abs(t.amount))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "hidden pr-6 text-right font-semibold tabular-nums sm:table-cell",
                          credit && "text-brand-emerald",
                        )}
                      >
                        {credit ? "+" : "−"}
                        {formatGhs(Math.abs(t.amount))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
