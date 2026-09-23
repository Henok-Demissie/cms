import { networkOf } from "@/lib/data"
import { cn } from "@/lib/utils"

export function NetworkChip({ id, className }: { id: string; className?: string }) {
  const n = networkOf(id)
  if (!n) {
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center self-start rounded-md bg-foreground px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-background",
          className,
        )}
      >
        {id.toUpperCase()}
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center self-start rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
        className,
      )}
      style={{ backgroundColor: n.color, color: n.fg }}
    >
      {n.short}
    </span>
  )
}
