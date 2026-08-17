type DashboardStatsProps = {
  active: number
  ongoing: number
  solved: number
}

export function DashboardStats({ active, ongoing, solved }: DashboardStatsProps) {
  const stats = [
    { label: "New complaints", value: active, hint: "Awaiting attention", trend: "Needs review" },
    { label: "In progress", value: ongoing, hint: "Being handled now", trend: "Active work" },
    { label: "Resolved", value: solved, hint: "Closed successfully", trend: "Completed" },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{stat.trend}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}
