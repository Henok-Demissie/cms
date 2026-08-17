// app/dashboard/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  if (session.user.role === "CUSTOMER") {
    const customerComplaints = await prisma.complaint.findMany({
      where: {
        tenantId,
        OR: [
          { customerEmail: session.user.email ?? undefined },
          { customerName: session.user.name ?? undefined },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    const firstName = session.user.name?.split(" ")[0] ?? "there";

    return (
      <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {greeting}, {firstName}! <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your complaint status and activity</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="Refresh dashboard" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-all duration-200 hover:rotate-180 hover:border-primary/50 hover:bg-accent hover:text-primary">
              <RefreshCw className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/complaints?new=1" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md">
              <Plus className="h-4 w-4" /> New Complaint
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">Recent complaints</h2><p className="text-xs text-muted-foreground">Your latest submitted cases</p></div><Link href="/dashboard/my-complaints" className="text-xs font-medium text-primary transition-colors hover:text-primary/75">View all</Link></div>
          {customerComplaints.length ? <div className="space-y-2">{customerComplaints.map((complaint) => <Link key={complaint.id} href={`/dashboard/complaints/${complaint.id}`} className="block rounded-lg border border-border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/30"><div className="flex items-center justify-between gap-3"><p className="font-medium">{complaint.title}</p><Badge variant="secondary">{complaint.status.replace(/_/g, " ")}</Badge></div><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{complaint.description}</p></Link>)}</div> : <div className="rounded-lg border border-dashed border-border p-6 text-center"><p className="text-sm font-medium">No complaints yet</p><p className="mt-1 text-xs text-muted-foreground">Use “New Complaint” to submit your first case.</p></div>}
        </section>
      </div>
    );
  }

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
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">Overview</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenant?.name ?? "Your organization"} complaint activity at a glance.
            </p>
          </div>
          {tenant && (
            <Link
              href={`/org/${tenant.subdomain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              New Complaint
              <Plus className="h-3.5 w-3.5" />
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
