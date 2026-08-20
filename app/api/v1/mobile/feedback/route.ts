import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"

const feedbackSchema = z.object({
  message: z.string().trim().min(2).max(5000),
  rating: z.number().int().min(1).max(5).default(5),
  tenantId: z.string().optional(),
  tenantSubdomain: z.string().trim().min(2).max(48).optional(),
})

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)
    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"

    const where = isCustomer
      ? {
          OR: [
            { customerId: user.id },
            { authorEmail: user.email },
          ],
        }
      : { tenantId: user.tenantId }

    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
    })

    return apiSuccess({ feedback })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load feedback", 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request)
    if (user.role !== "CUSTOMER" && user.accountType !== "customer") {
      return apiError("Only customer accounts can submit feedback", 403)
    }

    const parsed = feedbackSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid feedback", 400)

    let tenant = null
    if (parsed.data.tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } })
    } else if (parsed.data.tenantSubdomain) {
      tenant = await prisma.tenant.findUnique({ where: { subdomain: parsed.data.tenantSubdomain } })
    } else {
      tenant = await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })
    }

    if (!tenant) return apiError("Recipient organization was not found", 404)

    const feedback = await prisma.feedback.create({
      data: {
        tenantId: tenant.id,
        customerId: user.id,
        authorId: user.id,
        authorName: user.name,
        authorEmail: user.email,
        message: parsed.data.message,
        rating: parsed.data.rating,
        status: "NEW",
      },
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
    })

    return apiSuccess({ feedback }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to submit feedback", 500)
  }
}
