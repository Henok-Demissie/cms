"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createCustomerNotification } from "@/lib/notifications"

export async function submitSuggestion(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") throw new Error("Only customers can submit suggestions.")

  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const targetTenantId = formData.get("tenantId")?.toString().trim()

  if (!title || !description) throw new Error("A title and suggestion are required.")

  let tenant = null
  if (targetTenantId) {
    tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } })
  }
  if (!tenant) {
    tenant = (await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })) || (await prisma.tenant.findFirst())
  }
  if (!tenant) throw new Error("No organization found.")

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

  revalidatePath("/dashboard/suggestions")
  redirect("/dashboard/suggestions")
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
