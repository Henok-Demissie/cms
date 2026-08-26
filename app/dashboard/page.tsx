// app/dashboard/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Plus, RefreshCw } from "lucide-react";
import { AdminComplaintsDashboard } from "@/components/dashboard/admin-complaints-dashboard";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/notifications";

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
    // A customer sees the same dashboard as staff, over their own submissions only.
    //
    // Every ownership clause has to be non-empty: Prisma drops `undefined`
    // values, and an empty object inside `OR` matches every row — which here
    // would show one customer another customer's complaints.
    const complaintOwnership: Record<string, string>[] = [{ customerId: session.user.id }];
    const submissionOwnership: Record<string, string>[] = [
      { customerId: session.user.id },
      { authorId: session.user.id },
    ];
    if (session.user.email) {
      complaintOwnership.push({ customerEmail: session.user.email });
      submissionOwnership.push({ authorEmail: session.user.email });
    }
    const customerFilter = { OR: complaintOwnership };
    const authorFilter = { OR: submissionOwnership };

    const [
      recentComplaints,
      allComplaints,
      totalComplaints,
      active,
      ongoing,
      solved,
      totalSuggestions,
      totalFeedback,
      unreadNotifications,
    ] = await Promise.all([
      prisma.complaint.findMany({
        where: customerFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          customerName: true,
          title: true,
          status: true,
          priority: true,
          tenant: { select: { name: true } },
        },
      }),
      prisma.complaint.findMany({
        where: customerFilter,
        select: { createdAt: true },
      }),
      prisma.complaint.count({ where: customerFilter }),
      prisma.complaint.count({ where: { ...customerFilter, status: "NEW" } }),
      prisma.complaint.count({
        where: { ...customerFilter, status: { in: ["IN_PROGRESS", "IN_REVIEW", "ASSIGNED"] } },
      }),
      prisma.complaint.count({
        where: { ...customerFilter, status: { in: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.suggestion.count({ where: authorFilter }),
      prisma.feedback.count({ where: authorFilter }),
      getUnreadNotificationCount(session.user.id),
    ]);

    const resolutionRate = totalComplaints > 0 ? Math.round((solved / totalComplaints) * 100) : 100;
    const chartData = buildMonthlyChartData(allComplaints);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    const firstName = session.user.name?.split(" ")[0] ?? "there";

    return (
      <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                Customer Portal
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {greeting}, {firstName} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Your complaints, suggestions, and feedback across every organization you have contacted.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/notifications"
                className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-accent hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                aria-label="Refresh dashboard"
                className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-all duration-200 hover:rotate-180 hover:border-primary/50 hover:bg-accent hover:text-primary"
              >
                <RefreshCw className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/complaints"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> New Complaint
              </Link>
            </div>
          </div>
        </div>

        {unreadNotifications > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>
                You have{" "}
                <strong>
                  {unreadNotifications} new notification{unreadNotifications > 1 ? "s" : ""}
                </strong>{" "}
                regarding your cases.
              </span>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-xs font-semibold text-primary underline underline-offset-4"
            >
              View notifications →
            </Link>
          </div>
        )}

        <DashboardStats
          active={active}
          ongoing={ongoing}
          solved={solved}
          totalComplaints={totalComplaints}
          suggestionsCount={totalSuggestions}
          feedbackCount={totalFeedback}
          resolutionRate={resolutionRate}
        />

        <AdminComplaintsDashboard
          recentComplaints={recentComplaints.map((complaint) => ({
            ...complaint,
            organizationName: complaint.tenant.name,
          }))}
          chartData={chartData}
          viewAllHref="/dashboard/my-complaints"
          primaryColumnLabel="Organization"
        />
      </div>
    );
  }

  // Staff View: Enhanced Multi-Type Stats & Complaints Analytics
  const [
    tenant,
    totalComplaints,
    active,
    ongoing,
    solved,
    totalSuggestions,
    pendingSuggestions,
    totalFeedback,
    recentComplaints,
    allComplaints,
  ] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.complaint.count({ where: { tenantId } }),
    prisma.complaint.count({ where: { tenantId, status: "NEW" } }),
    prisma.complaint.count({
      where: { tenantId, status: { in: ["IN_PROGRESS", "IN_REVIEW", "ASSIGNED"] } },
    }),
    prisma.complaint.count({
      where: { tenantId, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.suggestion.count({ where: { tenantId } }),
    prisma.suggestion.count({ where: { tenantId, status: "NEW" } }),
    prisma.feedback.count({ where: { tenantId } }),
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

  const resolutionRate = totalComplaints > 0 ? Math.round((solved / totalComplaints) * 100) : 100;
  const chartData = buildMonthlyChartData(allComplaints);

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
              Staff Portal • {tenant?.name ?? "Organization"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back, {session.user.name?.split(" ")[0] ?? "Staff"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenant?.name ?? "Your organization"} complaints, suggestions, and customer feedback analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/complaints"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Review Complaints
            </Link>
          </div>
        </div>
      </div>

      <DashboardStats
        active={active}
        ongoing={ongoing}
        solved={solved}
        totalComplaints={totalComplaints}
        suggestionsCount={totalSuggestions}
        feedbackCount={totalFeedback}
        resolutionRate={resolutionRate}
      />

      <AdminComplaintsDashboard
        recentComplaints={recentComplaints}
        chartData={chartData}
      />
    </div>
  );
}
