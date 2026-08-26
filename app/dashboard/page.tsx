// app/dashboard/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { AdminComplaintsDashboard } from "@/components/dashboard/admin-complaints-dashboard";
import { StatsTabs } from "@/components/dashboard/stats-tabs";
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
      newSuggestions,
      reviewingSuggestions,
      acceptedSuggestions,
      totalFeedback,
      pendingFeedback,
      respondedFeedback,
      feedbackRating,
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
      prisma.suggestion.count({ where: { ...authorFilter, status: "NEW" } }),
      prisma.suggestion.count({ where: { ...authorFilter, status: "IN_REVIEW" } }),
      prisma.suggestion.count({ where: { ...authorFilter, status: "ACCEPTED" } }),
      prisma.feedback.count({ where: authorFilter }),
      prisma.feedback.count({ where: { ...authorFilter, status: "NEW", response: null } }),
      // "Responded" covers both an explicit REVIEWED status and any written reply.
      prisma.feedback.count({
        where: { AND: [authorFilter, { OR: [{ status: "REVIEWED" }, { NOT: { response: null } }] }] },
      }),
      prisma.feedback.aggregate({ where: authorFilter, _avg: { rating: true } }),
      getUnreadNotificationCount(session.user.id),
    ]);

    const resolutionRate = totalComplaints > 0 ? Math.round((solved / totalComplaints) * 100) : 100;
    const chartData = buildMonthlyChartData(allComplaints);

    return (
      <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
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

        <StatsTabs
          complaints={{
            total: totalComplaints,
            new: active,
            inProgress: ongoing,
            resolved: solved,
            resolutionRate,
          }}
          suggestions={{
            total: totalSuggestions,
            new: newSuggestions,
            inReview: reviewingSuggestions,
            accepted: acceptedSuggestions,
          }}
          feedback={{
            total: totalFeedback,
            pending: pendingFeedback,
            responded: respondedFeedback,
            averageRating: feedbackRating._avg.rating,
          }}
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
    reviewingSuggestions,
    acceptedSuggestions,
    totalFeedback,
    pendingFeedback,
    respondedFeedback,
    feedbackRating,
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
    prisma.suggestion.count({ where: { tenantId, status: "IN_REVIEW" } }),
    prisma.suggestion.count({ where: { tenantId, status: "ACCEPTED" } }),
    prisma.feedback.count({ where: { tenantId } }),
    prisma.feedback.count({ where: { tenantId, status: "NEW", response: null } }),
    // "Responded" covers both an explicit REVIEWED status and any written reply.
    prisma.feedback.count({
      where: { tenantId, OR: [{ status: "REVIEWED" }, { NOT: { response: null } }] },
    }),
    prisma.feedback.aggregate({ where: { tenantId }, _avg: { rating: true } }),
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

      <StatsTabs
        complaints={{
          total: totalComplaints,
          new: active,
          inProgress: ongoing,
          resolved: solved,
          resolutionRate,
        }}
        suggestions={{
          total: totalSuggestions,
          new: pendingSuggestions,
          inReview: reviewingSuggestions,
          accepted: acceptedSuggestions,
        }}
        feedback={{
          total: totalFeedback,
          pending: pendingFeedback,
          responded: respondedFeedback,
          averageRating: feedbackRating._avg.rating,
        }}
      />

      <AdminComplaintsDashboard
        recentComplaints={recentComplaints}
        chartData={chartData}
      />
    </div>
  );
}
