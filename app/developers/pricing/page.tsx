import { PageHeader } from "@/components/brand/page-header"
import { NetworkChip } from "@/components/brand/network-chip"
import { bundles, checkers, formatGhs } from "@/lib/data"

export default function DevPricingPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Pricing" subtitle="API prices are wallet-debited per successful order. Failed orders are refunded automatically." />
      <section className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Network</th>
              <th className="px-5 py-3">Bundle</th>
              <th className="px-5 py-3">Validity</th>
              <th className="px-5 py-3 text-right">API price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bundles.map((b) => (
              <tr key={b.id}>
                <td className="px-5 py-3">
                  <NetworkChip id={b.network} />
                </td>
                <td className="px-5 py-3 font-semibold">
                  {b.sizeGb}GB {b.flexa && <span className="ml-1 text-xs text-brand-emerald">Flexa</span>}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{b.validityDays} days</td>
                <td className="px-5 py-3 text-right font-mono font-bold">{formatGhs(b.price * 0.97)}</td>
              </tr>
            ))}
            {checkers.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{c.org}</span>
                </td>
                <td className="px-5 py-3 font-semibold">{c.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.year}</td>
                <td className="px-5 py-3 text-right font-mono font-bold">{formatGhs(c.price * 0.97)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
