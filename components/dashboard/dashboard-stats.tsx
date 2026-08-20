import { CheckCircle2, Clock3, FileText, Lightbulb, MessageSquare, Percent, TrendingUp } from "lucide-react"

type DashboardStatsProps = {
  active: number
  ongoing: number
  solved: number
  totalComplaints?: number
  suggestionsCount?: number
  feedbackCount?: number
  resolutionRate?: number
}

export function DashboardStats({
  active,
  ongoing,
  solved,
  totalComplaints = active + ongoing + solved,
  suggestionsCount = 0,
  feedbackCount = 0,
  resolutionRate = totalComplaints > 0 ? Math.round((solved / totalComplaints) * 100) : 100,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "New complaints",
      value: active,
      hint: "Awaiting triage",
      trend: "Urgent",
      icon: Clock3,
      tone: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "In progress",
      value: ongoing,
      hint: "Active cases",
      trend: "Handling",
      icon: TrendingUp,
      tone: "text-amber-400 bg-amber-400/10",
    },
    {
      label: "Resolved cases",
      value: solved,
      hint: "Closed successfully",
      trend: `${resolutionRate}% rate`,
      icon: CheckCircle2,
      tone: "text-emerald-400 bg-emerald-400/10",
    },
    {
      label: "Total suggestions",
      value: suggestionsCount,
      hint: "Customer ideas",
      trend: "Ideas",
      icon: Lightbulb,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Customer feedback",
      value: feedbackCount,
      hint: "Satisfaction reviews",
      trend: "Feedback",
      icon: MessageSquare,
      tone: "text-purple-400 bg-purple-400/10",
    },
    {
      label: "Resolution rate",
      value: `${resolutionRate}%`,
      hint: "Overall efficiency",
      trend: "Performance",
      icon: Percent,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${stat.tone}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
              <Icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.hint}</p>
          </div>
        )
      })}
    </div>
  )
}

