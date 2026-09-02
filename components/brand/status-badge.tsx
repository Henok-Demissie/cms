import { cn } from "@/lib/utils"

type Status = "delivered" | "processing" | "pending" | "failed" | "success" | "live" | "test" | "qualified" | "joined"

const styles: Record<Status, string> = {
  delivered: "bg-success/12 text-brand-emerald border-success/25",
  success: "bg-success/12 text-brand-emerald border-success/25",
  qualified: "bg-success/12 text-brand-emerald border-success/25",
  live: "bg-success/12 text-brand-emerald border-success/25",
  processing: "bg-info/12 text-info border-info/25",
  pending: "bg-warning/18 text-foreground border-warning/40",
  joined: "bg-muted text-muted-foreground border-border",
  test: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/10 text-destructive border-destructive/25",
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize",
        styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  )
}
