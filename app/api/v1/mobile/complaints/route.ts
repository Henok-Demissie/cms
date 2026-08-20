import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { customerComplaintFilter, requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"

const complaintSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  tenantId: z.string().optional(),
  tenantSubdomain: z.string().trim().min(2).max(48).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
})

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)
    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"
    const where = isCustomer ? customerComplaintFilter(user) : { tenantId: user.tenantId }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            author: { select: { id: true, name: true, role: true } },
            customer: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
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
    if (user.role !== "CUSTOMER" && user.accountType !== "customer") {
      return apiError("Only customer accounts can submit complaints", 403)
    }

    const parsed = complaintSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid complaint", 400)

    let tenant = null
    if (parsed.data.tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } })
    } else if (parsed.data.tenantSubdomain) {
      tenant = await prisma.tenant.findUnique({ where: { subdomain: parsed.data.tenantSubdomain } })
    } else {
      tenant = await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })
    }

    if (!tenant) return apiError("Recipient organization was not found", 404)

    const complaint = await prisma.complaint.create({
      data: {
        tenantId: tenant.id,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        source: "MOBILE",
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        status: "NEW",
      },
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
        messages: true,
      },
    })

    return apiSuccess({ complaint }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to submit complaint", 500)
  }
}
