"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatGhs, weeklySpend } from "@/lib/data"

const config = {
  spend: { label: "Spend", color: "var(--brand-green)" },
} satisfies ChartConfig

export function SpendChart() {
  const total = weeklySpend.reduce((s, d) => s + d.spend, 0)
  const count = weeklySpend.reduce((s, d) => s + d.orders, 0)
  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>Spending this week</CardTitle>
        <CardDescription>{count} orders across all networks</CardDescription>
        <CardAction>
          <span className="brand-gradient-text text-xl font-extrabold tabular-nums">{formatGhs(total)}</span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-48 w-full">
          <BarChart data={weeklySpend} margin={{ left: -16, right: 0, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="spend" fill="var(--color-spend)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
