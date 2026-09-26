import Link from "next/link"
import { Activity, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Clock, Gauge, KeyRound, ListChecks, Wallet, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/components/brand/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import { apiKeys, devMetrics, formatGhs, requestLogs, user } from "@/lib/data"

const metrics = [
  { icon: ListChecks, label: "API orders · 30d", value: devMetrics.apiOrders30d.toLocaleString() },
  { icon: CheckCircle2, label: "Delivered", value: devMetrics.delivered30d.toLocaleString() },
  {
    icon: Gauge,
    label: "Success rate",
    value: `${((devMetrics.delivered30d / devMetrics.apiOrders30d) * 100).toFixed(1)}%`,
    sub: `${devMetrics.failed30d} failed`,
  },
  { icon: Wallet, label: "Spend · 30d", value: formatGhs(devMetrics.spend30d) },
  { icon: Activity, label: "Requests · 30d", value: devMetrics.requests30d.toLocaleString() },
  { icon: Clock, label: "Avg latency · 30d", value: `${devMetrics.avgLatencyMs} ms` },
]

export default function DevelopersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your DataSpots developer console — Data bundles, MTN Flexa, Airtime &amp; Result Checkers, one API.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/developers/docs">
            <BookOpen className="size-4" /> API docs
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="brand-gradient brand-glow relative overflow-hidden rounded-2xl p-5 text-brand-deep">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-deep/12">
                <Wallet className="size-4" aria-hidden />
              </span>
              Wallet balance
            </p>
            <span className="rounded-full bg-brand-deep/12 px-2 py-0.5 font-mono text-[10px] font-bold">API</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{formatGhs(devMetrics.balance)}</p>
          <p className="mt-1 text-xs opacity-75">Funds every API purchase across all your keys.</p>
          <Button asChild className="mt-5 h-11 w-full border border-brand-deep/15 bg-brand-deep font-bold text-brand-deep-foreground hover:bg-brand-deep/90">
            <Link href="/dashboard/wallet">
              <ArrowUpRight className="size-4" /> Top up
            </Link>
          </Button>
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/25 blur-2xl" />
        </section>

        <section className="card-shadow rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
                <KeyRound className="size-4" aria-hidden />
              </span>
              API keys
            </p>
            <Link href="/developers/keys" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:underline">
              Manage <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{apiKeys.length}</span>
            <span className="text-sm text-muted-foreground">active keys</span>
          </p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Services enabled</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Data bundles", "MTN Flexa", "Airtime", "Result checkers"].map((s) => (
              <span key={s} className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-brand-emerald">
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="brand-gradient-soft card-shadow rounded-2xl border border-brand-green/30 p-5">
        <h2 className="inline-flex items-center gap-2 text-base font-bold">
          <Zap className="size-4 text-brand-emerald" aria-hidden /> Get started in 3 steps
        </h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm">
          {[
            <>
              <Link href="/developers/access" className="font-semibold text-brand-emerald underline underline-offset-2">Request API access</Link> — tell us your project &amp; the services you need; our team reviews it.
            </>,
            <>
              Once approved, <Link href="/developers/keys" className="font-semibold text-brand-emerald underline underline-offset-2">reveal your key</Link> (shown once) &amp; <Link href="/dashboard/wallet" className="font-semibold text-brand-emerald underline underline-offset-2">top up your wallet</Link>.
            </>,
            <>
              Make your first call — see the <Link href="/developers/docs" className="font-semibold text-brand-emerald underline underline-offset-2">docs</Link> &amp; <Link href="/developers/pricing" className="font-semibold text-brand-emerald underline underline-offset-2">pricing</Link>.
            </>,
          ].map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="brand-gradient mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-brand-deep">
                {i + 1}
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex items-center justify-between">
        <SectionLabel>Metrics</SectionLabel>
        <div className="flex gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
          {["7d", "30d", "90d"].map((r) => (
            <span key={r} className={`rounded-full px-2.5 py-1 ${r === "30d" ? "brand-gradient text-brand-deep" : "text-muted-foreground"}`}>
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="card-shadow rounded-2xl border border-border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
              <Icon className="size-4" aria-hidden />
            </span>
            <p className="mt-4 text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      <SectionLabel>Activity</SectionLabel>
      <section className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Path</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Latency</th>
              <th className="hidden px-5 py-3 text-right sm:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-xs">
            {requestLogs.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-bold">{r.method}</td>
                <td className="px-5 py-3">{r.path}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status < 400 ? "success" : "failed"} />
                </td>
                <td className="px-5 py-3 text-right">{r.ms} ms</td>
                <td className="hidden px-5 py-3 text-right text-muted-foreground sm:table-cell">{r.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
