import { apiError, apiSuccess } from "@/lib/api/response"
import { customerComplaintFilter, requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"
import { getUnreadNotificationCount } from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)
    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"

    if (isCustomer) {
      const filter = customerComplaintFilter(user)
      const authorFilter = {
        OR: [
          { customerId: user.id },
          { authorEmail: user.email },
        ],
      }

      const [
        total,
        active,
        resolved,
        complaintsCount,
        suggestionsCount,
        feedbackCount,
        recentComplaints,
        unreadNotifications,
      ] = await Promise.all([
        prisma.complaint.count({ where: filter }),
        prisma.complaint.count({
          where: {
            ...filter,
            status: { in: ["NEW", "IN_PROGRESS", "IN_REVIEW", "ASSIGNED"] },
          },
        }),
        prisma.complaint.count({
          where: {
            ...filter,
            status: { in: ["RESOLVED", "CLOSED"] },
          },
        }),
        prisma.complaint.count({ where: filter }),
        prisma.suggestion.count({ where: authorFilter }),
        prisma.feedback.count({ where: authorFilter }),
        prisma.complaint.findMany({
          where: filter,
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
            messages: { select: { id: true } },
          },
        }),
        getUnreadNotificationCount(user.id),
      ])

      return apiSuccess({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "CUSTOMER",
          accountType: "customer",
        },
        metrics: {
          total: complaintsCount + suggestionsCount + feedbackCount,
          active,
          resolved,
          complaints: complaintsCount,
          suggestions: suggestionsCount,
          feedback: feedbackCount,
          unreadNotifications,
        },
        complaints: recentComplaints,
      })
    }

    // Staff Dashboard
    const tenantId = user.tenantId
    const [
      tenant,
      total,
      newCount,
      ongoing,
      resolved,
      suggestionsCount,
      pendingSuggestions,
      feedbackCount,
      recentComplaints,
    ] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, subdomain: true, sector: true },
      }),
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
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          messages: { select: { id: true } },
        },
      }),
    ])

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        accountType: "staff",
      },
      tenant,
      metrics: {
        total,
        active: newCount + ongoing,
        resolved,
        new: newCount,
        ongoing,
        complaints: total,
        suggestions: suggestionsCount,
        pendingSuggestions,
        feedback: feedbackCount,
        resolutionRate,
      },
      complaints: recentComplaints,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load dashboard", 500)
  }
}
