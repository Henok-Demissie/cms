import { apiError, apiSuccess } from "@/lib/api/response"
import { customerComplaintFilter, requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)

    if (user.role === "CUSTOMER") {
      const where = customerComplaintFilter(user)
      const [total, active, resolved, complaints] = await Promise.all([
        prisma.complaint.count({ where }),
        prisma.complaint.count({ where: { ...where, status: { in: ["NEW", "IN_REVIEW", "ASSIGNED"] } } }),
        prisma.complaint.count({ where: { ...where, status: { in: ["RESOLVED", "CLOSED"] } } }),
        prisma.complaint.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
            tenant: { select: { name: true, subdomain: true } },
          },
        }),
      ])

      return apiSuccess({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        metrics: { total, active, resolved },
        complaints,
      })
    }

    const [total, active, resolved, complaints] = await Promise.all([
      prisma.complaint.count({ where: { tenantId: user.tenantId } }),
      prisma.complaint.count({ where: { tenantId: user.tenantId, status: { in: ["NEW", "IN_REVIEW", "ASSIGNED"] } } }),
      prisma.complaint.count({ where: { tenantId: user.tenantId, status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.complaint.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { id: true, title: true, status: true, priority: true, createdAt: true, updatedAt: true, customerName: true },
      }),
    ])

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      metrics: { total, active, resolved },
      complaints,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load dashboard", 500)
  }
}
