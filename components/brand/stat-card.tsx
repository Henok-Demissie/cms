import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; positive?: boolean }
  hint?: string
}

export function StatCard({ label, value, icon: Icon, delta, hint }: StatCardProps) {
  return (
    <Card className="card-shadow gap-3 py-5">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-extrabold tabular-nums tracking-tight">{value}</CardTitle>
        <CardAction>
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-brand-emerald">
            <Icon className="size-4" aria-hidden />
          </span>
        </CardAction>
      </CardHeader>
      {(delta || hint) && (
        <CardFooter className="flex items-center gap-2 text-xs text-muted-foreground">
          {delta && (
            <Badge variant="outline" className="gap-1 font-semibold">
              {delta.positive === false ? <TrendingDown /> : <TrendingUp />}
              {delta.value}
            </Badge>
          )}
          {hint && <span>{hint}</span>}
        </CardFooter>
      )}
    </Card>
  )
}
