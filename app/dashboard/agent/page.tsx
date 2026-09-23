import { Check, Store } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { Button } from "@/components/ui/button"
import { agentTiers, formatGhs } from "@/lib/data"

export default function AgentPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Agent Store" subtitle="Resell data at a discount and grow your own customer base" />

      <section className="brand-gradient-soft card-shadow flex flex-wrap items-center gap-4 rounded-2xl border border-brand-green/30 p-5">
        <span className="brand-gradient flex size-12 items-center justify-center rounded-full text-brand-deep">
          <Store className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="text-base font-bold">Become a DataSell agent</h2>
          <p className="text-sm text-muted-foreground">
            One-time upgrade. Discounts apply to every bundle across MTN, Telecel and AirtelTigo.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {agentTiers.map((t) => (
          <article
            key={t.id}
            className={`card-shadow relative flex flex-col gap-4 rounded-2xl border p-6 ${
              t.featured ? "border-brand-green bg-card ring-2 ring-brand-green/30" : "border-border bg-card"
            }`}
          >
            {t.featured && (
              <span className="brand-gradient absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                Most popular
              </span>
            )}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground">{t.name}</h3>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{formatGhs(t.price)}</p>
              <p className="brand-gradient-text mt-1 text-sm font-bold">{t.discount} off every bundle</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-emerald" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <Button
              className={
                t.featured
                  ? "brand-gradient brand-glow mt-auto h-11 font-bold text-brand-deep hover:opacity-90"
                  : "mt-auto h-11 font-semibold"
              }
              variant={t.featured ? "default" : "outline"}
            >
              Upgrade
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}
