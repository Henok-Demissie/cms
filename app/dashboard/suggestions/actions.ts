"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { FormResult } from "@/lib/form-result"
import { createCustomerNotification } from "@/lib/notifications"

export async function submitSuggestion(formData: FormData): Promise<FormResult> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: "Your session has expired. Please sign in again." }
  }
  if (session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Only customers can submit suggestions." }
  }

  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const targetTenantId = formData.get("tenantId")?.toString().trim()

  if (!title || !description) {
    return { ok: false, error: "A title and suggestion details are both required." }
  }

  try {
    let tenant = null
    if (targetTenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } })
    }
    if (!tenant) {
      tenant = (await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })) || (await prisma.tenant.findFirst())
    }
    if (!tenant) return { ok: false, error: "No organization is available to receive suggestions." }

    await prisma.suggestion.create({
      data: {
        tenantId: tenant.id,
        customerId: session.user.id,
        authorId: session.user.id,
        authorName: session.user.name || null,
        authorEmail: session.user.email || null,
        title,
        description,
        status: "NEW",
      },
    })
  } catch (error) {
    console.error("submitSuggestion failed:", error)
    return { ok: false, error: "Could not save your suggestion. Please try again." }
  }

  revalidatePath("/dashboard/suggestions")
  return { ok: true, message: "Suggestion submitted" }
}

export async function respondSuggestion(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/dashboard/suggestions`)
  if (session.user.role === "CUSTOMER") throw new Error("Only staff can respond to suggestions.")

  const response = formData.get("response")?.toString().trim()
  const status = formData.get("status")?.toString().trim() || "ACCEPTED"
  if (!response) throw new Error("A response message is required.")

  const suggestion = await prisma.suggestion.findUnique({
    where: { id },
    include: { tenant: true },
  })
  if (!suggestion || suggestion.tenantId !== session.user.tenantId) {
    throw new Error("Suggestion not found or access denied.")
  }

  await prisma.suggestion.update({
    where: { id },
    data: {
      response,
      respondedAt: new Date(),
      status,
      updatedAt: new Date(),
    },
  })

  // 🔔 Notify Customer
  if (suggestion.customerId) {
    await createCustomerNotification({
      customerId: suggestion.customerId,
      type: "SUGGESTION_RESPONSE",
      title: `Suggestion Update from ${suggestion.tenant.name}`,
      message: `${suggestion.tenant.name} responded to "${suggestion.title}": Status set to ${status}.`,
      refType: "SUGGESTION",
      refId: suggestion.id,
    })
  }

  revalidatePath("/dashboard/suggestions")
  revalidatePath("/dashboard/notifications")
}
