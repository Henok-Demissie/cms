"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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
};

type AdminComplaintsDashboardProps = {
  recentComplaints: RecentComplaint[];
  chartData: ChartPoint[];
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function AdminComplaintsDashboard({
  recentComplaints,
  chartData,
}: AdminComplaintsDashboardProps) {
  const total = chartData.reduce((sum, point) => sum + point.complaints, 0);

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
          <CardTitle className="text-sm font-medium">Volume trend</CardTitle>
          <span className="text-xs text-muted-foreground">{total} total</span>
        </CardHeader>
        <CardContent className="px-2 pb-3 pt-0">
          <ChartContainer config={chartConfig} className="h-[100px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 4, right: 4, top: 4, bottom: 0 }}
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
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
          <p className="flex items-center gap-1 px-2 text-[10px] text-muted-foreground">
            Last 6 months <TrendingUp className="size-3" />
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-medium">
            Recent complaints
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          {recentComplaints.length === 0 ? (
            <p className="text-xs text-muted-foreground">No complaints yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs">Customer</TableHead>
                  <TableHead className="h-8 text-xs">Issue</TableHead>
                  <TableHead className="h-8 text-xs">Status</TableHead>
                  <TableHead className="h-8 text-xs">Priority</TableHead>
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
                        {complaint.customerName || "Unknown customer"}
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
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {formatStatus(complaint.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        variant={
                          complaint.priority === "CRITICAL"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {complaint.priority}
                      </Badge>
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