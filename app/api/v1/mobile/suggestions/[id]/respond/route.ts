import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

const respondSchema = z.object({
  response: z.string().trim().min(1).max(5000),
  status: z.enum(["NEW", "IN_REVIEW", "ACCEPTED", "DECLINED"]).default("ACCEPTED"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    if (user.role === "CUSTOMER" || user.accountType === "customer") {
      return apiError("Only staff accounts can respond to suggestions", 403)
    }

    const parsed = respondSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid response", 400)

    const suggestion = await prisma.suggestion.findUnique({
      where: { id },
      include: { tenant: true },
    })

    if (!suggestion) return apiError("Suggestion not found", 404)
    if (suggestion.tenantId !== user.tenantId) {
      return apiError("You do not have access to suggestions outside your organization", 403)
    }

    const updated = await prisma.suggestion.update({
      where: { id },
      data: {
        response: parsed.data.response,
        status: parsed.data.status,
        respondedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
    })

    // 🔔 CREATE NOTIFICATION FOR CUSTOMER
    if (suggestion.customerId) {
      await createCustomerNotification({
        customerId: suggestion.customerId,
        type: "SUGGESTION_RESPONSE",
        title: `Suggestion Update from ${suggestion.tenant.name}`,
        message: `${suggestion.tenant.name} responded to your suggestion "${suggestion.title}": Status set to ${parsed.data.status}.`,
        refType: "SUGGESTION",
        refId: suggestion.id,
      })
    }

    return apiSuccess({ suggestion: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to respond to suggestion", 500)
  }
}
