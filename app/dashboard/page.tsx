// app/dashboard/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminComplaintsDashboard } from "@/components/dashboard/admin-complaints-dashboard";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { prisma } from "@/lib/prisma";

function buildMonthlyChartData(
  complaints: { createdAt: Date }[],
): { month: string; complaints: number }[] {
  const months: { month: string; complaints: number }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - i);

    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    const count = complaints.filter((complaint) => {
      const created = complaint.createdAt;
      return (
        created.getFullYear() === year && created.getMonth() === monthIndex
      );
    }).length;

    months.push({ month, complaints: count });
  }

  return months;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const tenantId = session.user.tenantId;

  const [tenant, active, ongoing, solved, recentComplaints, allComplaints] =
    await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.complaint.count({ where: { tenantId, status: "NEW" } }),
      prisma.complaint.count({
        where: { tenantId, status: { in: ["IN_REVIEW", "ASSIGNED"] } },
      }),
      prisma.complaint.count({
        where: { tenantId, status: { in: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.complaint.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          customerName: true,
          title: true,
          status: true,
          priority: true,
        },
      }),
      prisma.complaint.findMany({
        where: { tenantId },
        select: { createdAt: true },
      }),
    ]);

  const chartData = buildMonthlyChartData(allComplaints);

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Dashboard</p>
            <h1 className="text-xl font-semibold">
              {tenant?.name ?? "Your organization"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Overview of complaint activity for {session.user.name}
            </p>
          </div>
          {tenant && (
            <Link
              href={`/org/${tenant.subdomain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              Open public complaint form
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <DashboardStats active={active} ongoing={ongoing} solved={solved} />

      <AdminComplaintsDashboard
        recentComplaints={recentComplaints}
        chartData={chartData}
      />
    </div>
  );
}
