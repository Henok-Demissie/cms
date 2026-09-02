import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { NetworkChip } from "@/components/brand/network-chip"
import { cn } from "@/lib/utils"
import { formatGhs, type Bundle } from "@/lib/data"

export function BundleCard({ bundle, onSelect }: { bundle: Bundle; onSelect: () => void }) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Buy ${bundle.sizeGb}GB for ${formatGhs(bundle.price)}`}
      className={cn(
        "card-shadow cursor-pointer gap-3 py-5 transition-all outline-none hover:-translate-y-0.5 hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        bundle.popular && "border-primary/40",
      )}
    >
      <CardHeader className="flex items-center justify-between">
        <NetworkChip id={bundle.network} />
        {bundle.popular && <Badge className="brand-gradient border-0 text-brand-deep">Popular</Badge>}
      </CardHeader>
      <CardContent>
        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tabular-nums tracking-tight">{bundle.sizeGb}</span>
          <span className="text-sm font-semibold text-muted-foreground">GB</span>
        </p>
        <p className="brand-gradient-text mt-1 text-lg font-extrabold tabular-nums">{formatGhs(bundle.price)}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="secondary" className="gap-1 text-brand-emerald">
          <CalendarDays />
          {bundle.validityDays}-day validity
        </Badge>
      </CardFooter>
    </Card>
  )
}
