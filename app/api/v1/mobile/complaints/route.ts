import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { customerComplaintFilter, requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"

const complaintSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  tenantSubdomain: z.string().trim().min(2).max(48).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
})

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)
    const where = user.role === "CUSTOMER" ? customerComplaintFilter(user) : { tenantId: user.tenantId }
    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { tenant: { select: { name: true, subdomain: true } } },
    })
    return apiSuccess({ complaints })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load complaints", 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request)
    if (user.role !== "CUSTOMER") return apiError("Only customer accounts can submit from the mobile app", 403)

    const parsed = complaintSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid complaint", 400)

    const tenant = parsed.data.tenantSubdomain
      ? await prisma.tenant.findUnique({ where: { subdomain: parsed.data.tenantSubdomain } })
      : await prisma.tenant.findUnique({ where: { subdomain: "public" } })
    if (!tenant) return apiError("Recipient organization was not found", 404)

    const complaint = await prisma.complaint.create({
      data: {
        tenantId: tenant.id,
        customerName: user.name,
        customerEmail: user.email,
        source: "MOBILE",
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
      },
      include: { tenant: { select: { name: true, subdomain: true } } },
    })

    return apiSuccess({ complaint }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to submit complaint", 500)
  }
}
