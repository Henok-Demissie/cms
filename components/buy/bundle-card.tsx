import { CalendarDays } from "lucide-react"
import { NetworkChip } from "@/components/brand/network-chip"
import { formatGhs, type Bundle } from "@/lib/data"

export function BundleCard({ bundle, onSelect }: { bundle: Bundle; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="card-shadow group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-green/60"
    >
      {bundle.popular && (
        <span className="brand-gradient absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
          Popular
        </span>
      )}
      <NetworkChip id={bundle.network} />
      <p className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight">{bundle.sizeGb}</span>
        <span className="text-sm font-semibold text-muted-foreground">GB</span>
      </p>
      <p className="brand-gradient-text text-lg font-extrabold">{formatGhs(bundle.price)}</p>
      <span className="inline-flex w-fit items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-brand-emerald">
        <CalendarDays className="size-3" aria-hidden /> {bundle.validityDays}-day validity
      </span>
    </button>
  )
}
