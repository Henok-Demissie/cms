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
import { formatDate, formatGhs, formatTime } from "@/lib/data"

// Real transaction row shape from the DB
interface DbTransaction {
  id: number
  userId: string
  amount: unknown
  type: string
  description: string | null
  orderId: number | null
  createdAt: unknown
}

type Filter = "all" | "order" | "topup" | "refund" | "referral"

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "order", label: "Orders" },
  { id: "topup", label: "Top-ups" },
  { id: "refund", label: "Refunds" },
  { id: "referral", label: "Referrals" },
]

const kindIcon: Record<string, typeof Receipt> = {
  order: ShoppingCart,
  topup: ArrowDownToLine,
  refund: RotateCcw,
  referral: Gift,
}

export function TransactionsList({ transactions }: { transactions: DbTransaction[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [q, setQ] = useState("")

  const list = useMemo(
    () =>
      transactions.filter((t) => {
        const matchFilter = filter === "all" || t.type === filter
        const matchSearch =
          q === "" ||
          (t.description ?? "").toLowerCase().includes(q.toLowerCase()) ||
          String(t.id).includes(q)
        return matchFilter && matchSearch
      }),
    [filter, q, transactions],
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
            placeholder="Search description or ID"
            aria-label="Search transactions"
          />
        </InputGroup>
      </div>

      <Card className="card-shadow overflow-hidden py-0">
        <CardContent className="px-0">
          {list.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={transactions.length === 0 ? "No transactions yet" : "No results found"}
              description={
                transactions.length === 0
                  ? "Top up your wallet or place an order to get started."
                  : "Try a different filter or search term."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Description</TableHead>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden pr-6 text-right sm:table-cell">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((t) => {
                  const Icon = kindIcon[t.type] ?? Receipt
                  const amount = Number(t.amount)
                  const credit = amount > 0
                  const date = (t.createdAt as unknown as Date).toISOString()
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
                          <span className="truncate font-semibold">{t.description ?? t.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        #{t.id}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col text-muted-foreground">
                          <span>{formatDate(date)}</span>
                          <span className="text-xs">{formatTime(date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status="success" />
                          <span
                            className={cn(
                              "text-xs font-semibold tabular-nums sm:hidden",
                              credit && "text-brand-emerald",
                            )}
                          >
                            {credit ? "+" : "−"}
                            {formatGhs(Math.abs(amount))}
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
                        {formatGhs(Math.abs(amount))}
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
