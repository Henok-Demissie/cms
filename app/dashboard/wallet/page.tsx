import Link from "next/link"
import { ArrowRight, MinusCircle, PlusCircle, RefreshCw, Wallet } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { EmptyState } from "@/components/brand/empty-state"
import { StatusBadge } from "@/components/brand/status-badge"
import { DepositDialog } from "@/components/wallet/deposit-dialog"
import { Button } from "@/components/ui/button"
import { formatDate, formatGhs } from "@/lib/data"
import { getWalletBalance, getMyTransactions } from "@/app/actions/orders"

export const dynamic = "force-dynamic"

export default async function WalletPage() {
  const [balance, txns] = await Promise.all([getWalletBalance(), getMyTransactions()])

  const totalDeposited = txns
    .filter((t) => t.type === "topup")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const walletPayments = txns
    .filter((t) => t.type === "order")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  const recent = txns.slice(0, 5)

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title="Wallet" subtitle="Balance & activity" />

      <section className="brand-gradient brand-glow relative overflow-hidden rounded-2xl p-6 text-brand-deep">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-deep/12">
            <Wallet className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold">Available balance</p>
        </div>
        <p className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatGhs(balance)}</p>
        <div className="mt-6">
          <DepositDialog />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/25 blur-2xl" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-brand-green/40 bg-card p-5">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <PlusCircle className="size-4 text-brand-emerald" aria-hidden /> Total deposited
          </p>
          <p className="mt-2 text-2xl font-extrabold text-brand-emerald">{formatGhs(totalDeposited)}</p>
        </div>
        <div className="card-shadow rounded-2xl border border-border bg-card p-5">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <MinusCircle className="size-4 text-destructive" aria-hidden /> Wallet payments
          </p>
          <p className="mt-2 text-2xl font-extrabold">{formatGhs(walletPayments)}</p>
        </div>
      </div>

      <section className="card-shadow rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
              <RefreshCw className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold">Transactions</h2>
              <p className="text-xs text-muted-foreground">Last 5 activities</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-brand-emerald">
            <Link href="/dashboard/transactions">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions yet" description="Deposits and payments will appear here." className="border-0 shadow-none" />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((t) => {
              const amount = Number(t.amount)
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full ${
                      amount > 0 ? "bg-success/10 text-brand-emerald" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {amount > 0 ? <PlusCircle className="size-4" aria-hidden /> : <MinusCircle className="size-4" aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.description ?? t.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate((t.createdAt as unknown as Date).toISOString())}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-bold ${amount > 0 ? "text-brand-emerald" : ""}`}>
                      {amount > 0 ? "+" : "−"}
                      {formatGhs(amount)}
                    </span>
                    <StatusBadge status="success" />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
