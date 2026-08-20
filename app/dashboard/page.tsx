// app/dashboard/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CheckCircle2, ClipboardList, Lightbulb, MessageSquare, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    const customerFilter = {
      OR: [
        { customerId: session.user.id },
        { customerEmail: session.user.email ?? undefined },
      ],
    };
    const authorFilter = {
      OR: [
        { customerId: session.user.id },
        { authorEmail: session.user.email ?? undefined },
      ],
    };

    const [customerComplaints, totalComplaints, totalSuggestions, totalFeedback, unreadNotifications] =
      await Promise.all([
        prisma.complaint.findMany({
          where: customerFilter,
          include: {
            tenant: { select: { name: true, subdomain: true } },
            messages: { select: { id: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.complaint.count({ where: customerFilter }),
        prisma.suggestion.count({ where: authorFilter }),
        prisma.feedback.count({ where: authorFilter }),
        getUnreadNotificationCount(session.user.id),
      ]);

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
            <p className="mt-1 text-sm text-muted-foreground">
              Customer portal — track your submitted complaints, suggestions, and feedback across organizations.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              href="/dashboard/complaints?new=1"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New Complaint
            </Link>
          </div>
        </section>

        {/* Unread Notifications Banner */}
        {unreadNotifications > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>You have <strong>{unreadNotifications} new notification{unreadNotifications > 1 ? "s" : ""}</strong> regarding your cases.</span>
            </div>
            <Link href="/dashboard/notifications" className="text-xs font-semibold text-primary underline underline-offset-4">
              View notifications →
            </Link>
          </div>
        )}

        {/* Customer Summary Cards */}
        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/my-complaints"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30"
          >
            <div>
              <p className="text-xs text-muted-foreground">My Complaints</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{totalComplaints}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <ClipboardList className="h-5 w-5" />
            </span>
          </Link>
          <Link
            href="/dashboard/suggestions"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30"
          >
            <div>
              <p className="text-xs text-muted-foreground">My Suggestions</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{totalSuggestions}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
              <Lightbulb className="h-5 w-5" />
            </span>
          </Link>
          <Link
            href="/dashboard/feedback"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30"
          >
            <div>
              <p className="text-xs text-muted-foreground">My Feedback</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{totalFeedback}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 text-purple-500">
              <MessageSquare className="h-5 w-5" />
            </span>
          </Link>
        </section>

        {/* Recent Complaints */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Complaints & Status</h2>
              <p className="text-xs text-muted-foreground">Your latest submitted cases and responses</p>
            </div>
            <Link
              href="/dashboard/my-complaints"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/75"
            >
              View all
            </Link>
          </div>
          {customerComplaints.length ? (
            <div className="space-y-2">
              {customerComplaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/dashboard/complaints/${complaint.id}`}
                  className="block rounded-lg border border-border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{complaint.title}</p>
                      <Badge variant="outline" className="text-xs text-primary">
                        🏢 {complaint.tenant.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {complaint.messages.length > 0 && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {complaint.messages.length} reply
                        </span>
                      )}
                      <Badge variant="secondary">{complaint.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {complaint.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium">No complaints submitted yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use “New Complaint” to submit your first case to an organization.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  // Staff View: Enhanced Multi-Type Stats & Complaints Analytics
  const [
    tenant,
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

  const totalComplaints = active + ongoing + solved;
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
