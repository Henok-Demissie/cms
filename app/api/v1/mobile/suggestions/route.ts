import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"

const suggestionSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
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

    const suggestions = await prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
    })

    return apiSuccess({ suggestions })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load suggestions", 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request)
    if (user.role !== "CUSTOMER" && user.accountType !== "customer") {
      return apiError("Only customer accounts can submit suggestions", 403)
    }

    const parsed = suggestionSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid suggestion", 400)

    let tenant = null
    if (parsed.data.tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } })
    } else if (parsed.data.tenantSubdomain) {
      tenant = await prisma.tenant.findUnique({ where: { subdomain: parsed.data.tenantSubdomain } })
    } else {
      tenant = await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })
    }

    if (!tenant) return apiError("Recipient organization was not found", 404)

    const suggestion = await prisma.suggestion.create({
      data: {
        tenantId: tenant.id,
        customerId: user.id,
        authorId: user.id,
        authorName: user.name,
        authorEmail: user.email,
        title: parsed.data.title,
        description: parsed.data.description,
        status: "NEW",
      },
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
    })

    return apiSuccess({ suggestion }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to submit suggestion", 500)
  }
}
