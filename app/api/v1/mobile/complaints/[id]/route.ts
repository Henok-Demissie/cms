import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

const replySchema = z.object({
  message: z.string().trim().min(1).max(5000),
  status: z.enum(["NEW", "IN_PROGRESS", "IN_REVIEW", "ASSIGNED", "RESOLVED", "CLOSED", "ESCALATED"]).optional(),
})

// Mirrors the create schema in ../route.ts so an edit can't slip past its limits.
const editSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
})

const complaintInclude = {
  tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  messages: {
    include: {
      author: { select: { id: true, name: true, role: true } },
      customer: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const

/** Statuses a customer can no longer act on. */
const CLOSED_STATUSES = ["RESOLVED", "CLOSED"]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: complaintInclude,
    })

    if (!complaint) return apiError("Complaint not found", 404)

    // Authorization check
    if (isCustomer) {
      if (complaint.customerId !== user.id && complaint.customerEmail !== user.email) {
        return apiError("You do not have access to this complaint", 403)
      }
    } else {
      if (complaint.tenantId !== user.tenantId) {
        return apiError("You do not have access to complaints outside your organization", 403)
      }
    }

    return apiSuccess({ complaint })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load complaint details", 500)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"

    const parsed = replySchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid message", 400)

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { tenant: true },
    })

    if (!complaint) return apiError("Complaint not found", 404)

    // Authorization check
    if (isCustomer) {
      if (complaint.customerId !== user.id && complaint.customerEmail !== user.email) {
        return apiError("You do not have access to this complaint", 403)
      }
    } else {
      if (complaint.tenantId !== user.tenantId) {
        return apiError("You do not have access to complaints outside your organization", 403)
      }
    }

    if (complaint.status === "WITHDRAWN") {
      return apiError("This complaint was withdrawn, so the thread is closed", 403)
    }

    // Create message
    const message = await prisma.complaintMessage.create({
      data: {
        complaintId: id,
        authorId: isCustomer ? null : user.id,
        customerId: isCustomer ? user.id : null,
        authorName: user.name,
        authorRole: isCustomer ? "CUSTOMER" : (user.role || "AGENT"),
        message: parsed.data.message,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
        customer: { select: { id: true, name: true, role: true } },
      },
    })

    // Update status if provided or advance status
    const updateData: { updatedAt: Date; status?: string } = { updatedAt: new Date() }
    if (!isCustomer && parsed.data.status) {
      updateData.status = parsed.data.status
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: complaintInclude,
    })

    // 🔔 CREATE NOTIFICATION FOR CUSTOMER IF STAFF REPLIED
    if (!isCustomer && complaint.customerId) {
      await createCustomerNotification({
        customerId: complaint.customerId,
        type: "COMPLAINT_REPLY",
        title: `Reply from ${complaint.tenant.name}`,
        message: `${user.name} replied to your complaint "${complaint.title}": "${parsed.data.message.slice(0, 100)}${parsed.data.message.length > 100 ? "..." : ""}"`,
        refType: "COMPLAINT",
        refId: complaint.id,
      })
    }

    return apiSuccess({ message, complaint: updatedComplaint }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to post reply", 500)
  }
}

/**
 * Customer edits their own complaint. Only allowed while the case is untouched —
 * still NEW and with no replies — so staff never see the text change underneath
 * a conversation they have already started.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"
    if (!isCustomer) return apiError("Only the customer who filed a complaint can edit it", 403)

    const parsed = editSchema.safeParse(await request.json())
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid complaint", 400)

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { _count: { select: { messages: true } } },
    })

    if (!complaint) return apiError("Complaint not found", 404)
    if (complaint.customerId !== user.id && complaint.customerEmail !== user.email) {
      return apiError("You do not have access to this complaint", 403)
    }
    if (complaint.status === "WITHDRAWN") {
      return apiError("This complaint was withdrawn and can no longer be edited", 403)
    }
    if (complaint.status !== "NEW" || complaint._count.messages > 0) {
      return apiError("This complaint is already being handled, so it can no longer be edited", 403)
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
      },
      include: complaintInclude,
    })

    return apiSuccess({ complaint: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to update complaint", 500)
  }
}

/**
 * Customer withdraws their own complaint. This is a soft delete: the row stays
 * so the organization keeps its audit trail, but the status moves to WITHDRAWN,
 * which the dashboard counts as neither active nor resolved.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser(request)
    const { id } = await params

    const isCustomer = user.role === "CUSTOMER" || user.accountType === "customer"
    if (!isCustomer) return apiError("Only the customer who filed a complaint can withdraw it", 403)

    const complaint = await prisma.complaint.findUnique({ where: { id } })

    if (!complaint) return apiError("Complaint not found", 404)
    if (complaint.customerId !== user.id && complaint.customerEmail !== user.email) {
      return apiError("You do not have access to this complaint", 403)
    }
    if (complaint.status === "WITHDRAWN") {
      return apiError("This complaint has already been withdrawn", 400)
    }
    if (CLOSED_STATUSES.includes(complaint.status)) {
      return apiError("A resolved complaint can no longer be withdrawn", 403)
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: "WITHDRAWN" },
      include: complaintInclude,
    })

    return apiSuccess({ complaint: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to withdraw complaint", 500)
  }
}
