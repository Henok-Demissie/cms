"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

export async function submitFeedback(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") throw new Error("Only customers can submit feedback.")

  const message = formData.get("message")?.toString().trim()
  const rating = Number(formData.get("rating"))
  const targetTenantId = formData.get("tenantId")?.toString().trim()

  if (!message) throw new Error("Feedback message is required.")

  let tenant = null
  if (targetTenantId) {
    tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } })
  }
  if (!tenant) {
    tenant = (await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })) || (await prisma.tenant.findFirst())
  }
  if (!tenant) throw new Error("No organization found.")

  await prisma.feedback.create({
    data: {
      tenantId: tenant.id,
      customerId: session.user.id,
      authorId: session.user.id,
      authorName: session.user.name || null,
      authorEmail: session.user.email || null,
      message,
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 5,
      status: "NEW",
    },
  })

  revalidatePath("/dashboard/feedback")
  redirect("/dashboard/feedback")
}

export async function respondFeedback(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/dashboard/feedback`)
  if (session.user.role === "CUSTOMER") throw new Error("Only staff can respond to feedback.")

  const response = formData.get("response")?.toString().trim()
  if (!response) throw new Error("A response message is required.")

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: { tenant: true },
  })
  if (!feedback || feedback.tenantId !== session.user.tenantId) {
    throw new Error("Feedback not found or access denied.")
  }

  await prisma.feedback.update({
    where: { id },
    data: {
      response,
      respondedAt: new Date(),
      status: "REVIEWED",
      updatedAt: new Date(),
    },
  })

  // 🔔 Notify Customer
  if (feedback.customerId) {
    await createCustomerNotification({
      customerId: feedback.customerId,
      type: "FEEDBACK_RESPONSE",
      title: `Response to your feedback from ${feedback.tenant.name}`,
      message: `${feedback.tenant.name} replied to your review: "${response.slice(0, 100)}${response.length > 100 ? "..." : ""}"`,
      refType: "FEEDBACK",
      refId: feedback.id,
    })
  }

  revalidatePath("/dashboard/feedback")
  revalidatePath("/dashboard/notifications")
}
