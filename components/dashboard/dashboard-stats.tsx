type DashboardStatsProps = {
  active: number
  ongoing: number
  solved: number
}

export function DashboardStats({ active, ongoing, solved }: DashboardStatsProps) {
  const stats = [
    { label: "Active complaints", value: active, hint: "New and unassigned" },
    { label: "Ongoing", value: ongoing, hint: "In review or assigned" },
    { label: "Solved", value: solved, hint: "Resolved or closed" },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}
