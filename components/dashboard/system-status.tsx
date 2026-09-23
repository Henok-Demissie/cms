import { ShieldCheck, Zap } from "lucide-react"

export function SystemStatus() {
  return (
    <section className="card-shadow rounded-2xl border border-success/30 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="pulse-dot size-2.5 rounded-full bg-brand-green" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">System online</h2>
          </div>
          <p className="text-sm text-muted-foreground">Orders are processing normally.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 font-semibold text-brand-emerald">
            24/7
          </span>
          <span className="font-mono text-muted-foreground">avg 00:44</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
          <Zap className="size-3.5 text-brand-emerald" aria-hidden /> Fast delivery
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
          <ShieldCheck className="size-3.5 text-brand-emerald" aria-hidden /> Secure payments
        </span>
      </div>
    </section>
  )
}
