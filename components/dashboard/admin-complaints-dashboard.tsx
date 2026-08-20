"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  complaints: {
    label: "Complaints",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ChartPoint = {
  month: string;
  complaints: number;
};

type RecentComplaint = {
  id: string;
  customerName: string | null;
  title: string;
  status: string;
  priority: string;
  /**
   * Shown instead of customerName in the first column. Staff care who filed the
   * complaint; a customer looking at their own complaints cares who received it.
   */
  organizationName?: string | null;
};

type AdminComplaintsDashboardProps = {
  recentComplaints: RecentComplaint[];
  chartData: ChartPoint[];
  viewAllHref?: string;
  primaryColumnLabel?: string;
};

export function AdminComplaintsDashboard({
  recentComplaints,
  chartData,
  viewAllHref = "/dashboard/complaints",
  primaryColumnLabel = "Customer",
}: AdminComplaintsDashboardProps) {
  const total = chartData.reduce((sum, point) => sum + point.complaints, 0);

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
          <div>
            <CardTitle className="text-sm font-medium">Complaint volume</CardTitle>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Activity over the last 6 months</p>
          </div>
          <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{total} total</span>
        </CardHeader>
        <CardContent className="px-2 pb-3 pt-0">
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="complaints"
                type="monotone"
                fill="var(--color-complaints)"
                fillOpacity={0.25}
                stroke="var(--color-complaints)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          <p className="flex items-center gap-1 px-2 text-[10px] text-muted-foreground">
            Updated in real time <TrendingUp className="size-3 text-primary" />
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <CardTitle className="text-sm font-medium">Recent complaints</CardTitle>
          <Link href={viewAllHref} className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
            View all <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          {recentComplaints.length === 0 ? (
            <p className="text-xs text-muted-foreground">No complaints yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs">{primaryColumnLabel}</TableHead>
                  <TableHead className="h-8 text-xs">Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="py-2 text-xs">
                      <Link
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="block w-full"
                      >
                        {complaint.organizationName ?? complaint.customerName ?? "Unknown customer"}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      <Link
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="block w-full"
                      >
                        {complaint.title}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
