"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { FormResult } from "@/lib/form-result"

export async function submitComplaint(formData: FormData): Promise<FormResult> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: "Your session has expired. Please sign in again." }
  }
  if (session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Staff cannot submit customer complaints." }
  }

  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const targetTenantId = formData.get("tenantId")?.toString().trim()

  if (!title || !description) {
    return { ok: false, error: "A title and description are both required." }
  }

  try {
    let tenant = null
    if (targetTenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } })
    }
    if (!tenant) {
      tenant = (await prisma.tenant.findFirst({ where: { subdomain: { not: "public" } } })) || (await prisma.tenant.findFirst())
    }
    if (!tenant) return { ok: false, error: "No organization is available to receive complaints." }

    await prisma.complaint.create({
      data: {
        tenantId: tenant.id,
        customerId: session.user.id,
        customerName: session.user.name || null,
        customerEmail: session.user.email || null,
        source: "WEB",
        title,
        description,
        status: "NEW",
        priority: "MEDIUM",
      },
    })
  } catch (error) {
    console.error("submitComplaint failed:", error)
    return { ok: false, error: "Could not file your complaint. Please try again." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")
  revalidatePath("/dashboard/my-complaints")
  return { ok: true, message: "Complaint submitted" }
}
