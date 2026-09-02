"use client"

import { Bar, BarChart, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatGhs, weeklySpend } from "@/lib/data"

const config = {
  spend: { label: "Spend", color: "var(--brand-green)" },
} satisfies ChartConfig

export function SpendChart() {
  const total = weeklySpend.reduce((s, d) => s + d.spend, 0)
  const count = weeklySpend.reduce((s, d) => s + d.orders, 0)
  return (
    <section className="card-shadow rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="title-bar text-sm font-bold">This week</h2>
          <p className="mt-1 text-xs text-muted-foreground">{count} orders</p>
        </div>
        <p className="brand-gradient-text text-xl font-extrabold">{formatGhs(total)}</p>
      </div>
      <ChartContainer config={config} className="mt-4 h-36 w-full">
        <BarChart data={weeklySpend} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="spend" fill="var(--color-spend)" radius={6} />
        </BarChart>
      </ChartContainer>
    </section>
  )
}
