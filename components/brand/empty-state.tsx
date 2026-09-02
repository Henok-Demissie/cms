import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-6 py-14 text-center", className)}>
      <div className="brand-gradient-soft grid size-16 place-items-center rounded-2xl border border-primary/20">
        <Icon className="size-7 text-brand-emerald" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-bold">{title}</p>
        {description && <p className="max-w-xs text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action}
    </div>
  )
}
