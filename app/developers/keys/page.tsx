import { KeyRound, Plus, RotateCcw, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { apiKeys, formatDate } from "@/lib/data"

export default function KeysPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="API keys"
        subtitle="Keys are shown once at creation. Rotate if you suspect a leak."
        actions={
          <Button className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
            <Plus className="size-4" /> New key
          </Button>
        }
      />
      <ul className="flex flex-col gap-3">
        {apiKeys.map((k) => (
          <li key={k.id} className="card-shadow flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
              <KeyRound className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-bold">
                {k.label} <StatusBadge status={k.env as "live" | "test"} />
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{k.prefix}••••••••••••••••</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Created {formatDate(k.created)}</p>
              <p>Last used {k.lastUsed}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label={`Rotate ${k.label}`}>
                <RotateCcw className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Revoke ${k.label}`} className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
