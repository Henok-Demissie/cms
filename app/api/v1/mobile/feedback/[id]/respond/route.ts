import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

const respondSchema = z.object({
  response: z.string().trim().min(1).max(5000),
  status: z.enum(["NEW", "REVIEWED"]).default("REVIEWED"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    if (user.role === "CUSTOMER" || user.accountType === "customer") {
      return apiError("Only staff accounts can respond to feedback", 403)
    }

    const parsed = respondSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid response", 400)

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { tenant: true },
    })

    if (!feedback) return apiError("Feedback not found", 404)
    if (feedback.tenantId !== user.tenantId) {
      return apiError("You do not have access to feedback outside your organization", 403)
    }

    const updated = await prisma.feedback.update({
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
    if (feedback.customerId) {
      await createCustomerNotification({
        customerId: feedback.customerId,
        type: "FEEDBACK_RESPONSE",
        title: `Response to your feedback from ${feedback.tenant.name}`,
        message: `${feedback.tenant.name} replied to your review: "${parsed.data.response.slice(0, 100)}${parsed.data.response.length > 100 ? "..." : ""}"`,
        refType: "FEEDBACK",
        refId: feedback.id,
      })
    }

    return apiSuccess({ feedback: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to respond to feedback", 500)
  }
}
