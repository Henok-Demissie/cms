"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  MessageSquare,
  Search,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ComplaintStats = {
  total: number
  new: number
  inProgress: number
  resolved: number
  resolutionRate: number
}

export type SuggestionStats = {
  total: number
  new: number
  inReview: number
  accepted: number
}

export type FeedbackStats = {
  total: number
  pending: number
  responded: number
  /** null when nothing has been rated yet. */
  averageRating: number | null
}

type Stat = {
  label: string
  value: string | number
  hint: string
  trend: string
  icon: LucideIcon
  tone: string
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/20"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${stat.tone}`}>
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

/**
 * Dashboard stat cards, grouped by submission type. Only the selected tab's cards
 * are shown — the complaints, suggestions and feedback pages no longer repeat them.
 */
export function StatsTabs({
  complaints,
  suggestions,
  feedback,
}: {
  complaints: ComplaintStats
  suggestions: SuggestionStats
  feedback: FeedbackStats
}) {
  const complaintStats: Stat[] = [
    {
      label: "Total complaints",
      value: complaints.total,
      hint: "All complaints on record",
      trend: "Total",
      icon: FileText,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "New complaints",
      value: complaints.new,
      hint: "Awaiting triage",
      trend: "Urgent",
      icon: Clock3,
      tone: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "In progress",
      value: complaints.inProgress,
      hint: "Active complaints",
      trend: "Handling",
      icon: TrendingUp,
      tone: "text-amber-400 bg-amber-400/10",
    },
    {
      label: "Resolved complaints",
      value: complaints.resolved,
      hint: "Closed successfully",
      trend: `${complaints.resolutionRate}% rate`,
      icon: CheckCircle2,
      tone: "text-emerald-400 bg-emerald-400/10",
    },
  ]

  const suggestionStats: Stat[] = [
    {
      label: "Total suggestions",
      value: suggestions.total,
      hint: "Ideas on record",
      trend: "Total",
      icon: Lightbulb,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "New",
      value: suggestions.new,
      hint: "Awaiting review",
      trend: "New",
      icon: Clock3,
      tone: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "Under review",
      value: suggestions.inReview,
      hint: "Being considered",
      trend: "Reviewing",
      icon: Search,
      tone: "text-amber-400 bg-amber-400/10",
    },
    {
      label: "Accepted",
      value: suggestions.accepted,
      hint: "Ideas adopted",
      trend: "Accepted",
      icon: CheckCircle2,
      tone: "text-emerald-400 bg-emerald-400/10",
    },
  ]

  const feedbackStats: Stat[] = [
    {
      label: "Total feedback",
      value: feedback.total,
      hint: "Reviews on record",
      trend: "Total",
      icon: MessageSquare,
      tone: "text-purple-400 bg-purple-400/10",
    },
    {
      label: "Pending",
      value: feedback.pending,
      hint: "Awaiting a reply",
      trend: "Pending",
      icon: Clock3,
      tone: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "Responded",
      value: feedback.responded,
      hint: "Replied to",
      trend: "Responded",
      icon: CheckCircle2,
      tone: "text-emerald-400 bg-emerald-400/10",
    },
    {
      label: "Average rating",
      value: feedback.averageRating === null ? "—" : `${feedback.averageRating.toFixed(1)} / 5`,
      hint: "Across every rating",
      trend: "Rating",
      icon: Star,
      tone: "text-amber-400 bg-amber-400/10",
    },
  ]

  return (
    <Tabs defaultValue="complaints">
      <TabsList>
        <TabsTrigger value="complaints">
          <FileText className="h-3.5 w-3.5" />
          Complaints
        </TabsTrigger>
        <TabsTrigger value="suggestions">
          <Lightbulb className="h-3.5 w-3.5" />
          Suggestions
        </TabsTrigger>
        <TabsTrigger value="feedback">
          <MessageSquare className="h-3.5 w-3.5" />
          Feedback
        </TabsTrigger>
      </TabsList>

      <TabsContent value="complaints">
        <StatGrid stats={complaintStats} />
      </TabsContent>
      <TabsContent value="suggestions">
        <StatGrid stats={suggestionStats} />
      </TabsContent>
      <TabsContent value="feedback">
        <StatGrid stats={feedbackStats} />
      </TabsContent>
    </Tabs>
  )
}
