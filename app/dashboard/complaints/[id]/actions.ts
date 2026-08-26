"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

function refreshComplaintPages(id: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")
  revalidatePath("/dashboard/notifications")
  revalidatePath(`/dashboard/complaints/${id}`)
}

function requireStaff(role: string) {
  if (role === "CUSTOMER") throw new Error("Only staff can manage complaints.")
}

export async function assignComplaintToMe(id: string) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  }
  requireStaff(session.user.role)

  const result = await prisma.complaint.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: { notIn: ["RESOLVED", "CLOSED"] },
    },
    data: {
      assignedToId: session.user.id,
      assignedAt: new Date(),
      status: "ASSIGNED",
    },
  })

  if (result.count === 0) {
    throw new Error("This complaint cannot be assigned.")
  }

  refreshComplaintPages(id)
}

export async function closeComplaint(id: string) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  }
  requireStaff(session.user.role)

  const result = await prisma.complaint.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: { not: "CLOSED" },
    },
    data: { status: "CLOSED" },
  })

  if (result.count === 0) {
    throw new Error("This complaint is already closed or no longer exists.")
  }

  refreshComplaintPages(id)
}

export async function replyToComplaint(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  const message = formData.get("message")?.toString().trim()
  if (!message) throw new Error("A reply is required.")

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { tenant: true },
  })
  if (!complaint) throw new Error("Complaint not found.")

  const isCustomer = session.user.role === "CUSTOMER"
  if (isCustomer) {
    if (complaint.customerId !== session.user.id && complaint.customerEmail !== session.user.email) {
      throw new Error("You do not have permission to reply to this complaint.")
    }
  } else {
    if (complaint.tenantId !== session.user.tenantId) {
      throw new Error("You do not have permission to reply to this complaint.")
    }
  }

  await prisma.complaintMessage.create({
    data: {
      complaintId: id,
      authorId: isCustomer ? null : session.user.id,
      customerId: isCustomer ? session.user.id : null,
      authorName: session.user.name || (isCustomer ? "Customer" : "Staff"),
      authorRole: isCustomer ? "CUSTOMER" : (session.user.role || "AGENT"),
      message,
    },
  })

  await prisma.complaint.update({
    where: { id },
    data: {
      status: isCustomer ? "IN_PROGRESS" : "IN_REVIEW",
      updatedAt: new Date(),
    },
  })

  // 🔔 Notify Customer when staff replies
  if (!isCustomer && complaint.customerId) {
    await createCustomerNotification({
      customerId: complaint.customerId,
      type: "COMPLAINT_REPLY",
      title: `Response from ${complaint.tenant.name}`,
      message: `${session.user.name || "Staff"} replied to "${complaint.title}": "${message.slice(0, 100)}${message.length > 100 ? "..." : ""}"`,
      refType: "COMPLAINT",
      refId: complaint.id,
    })
  }

  refreshComplaintPages(id)
}

export async function reactToComplaint(id: string, type: "ACKNOWLEDGED" | "PRIORITY") {
  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  requireStaff(session.user.role)
  const complaint = await prisma.complaint.findFirst({ where: { id, tenantId: session.user.tenantId }, select: { id: true } })
  if (!complaint) throw new Error("Complaint not found.")
  await prisma.complaintReaction.upsert({
    where: { complaintId_staffId_type: { complaintId: id, staffId: session.user.id, type } },
    create: { complaintId: id, staffId: session.user.id, type },
    update: {},
  })
  refreshComplaintPages(id)
}
