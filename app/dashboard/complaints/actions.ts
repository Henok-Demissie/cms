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

// Same limits the mobile PATCH route enforces, so both clients accept the same text.
const TITLE_MIN = 3
const TITLE_MAX = 150
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 5000

/**
 * Customer edits their own complaint.
 *
 * Only while it is untouched — still NEW with no replies — so staff never see the
 * text change underneath a conversation they have already started. This mirrors
 * PATCH /api/v1/mobile/complaints/[id], which the phone app uses for the same
 * thing; the rule has to match or the same complaint would be editable on one
 * client and not the other.
 */
export async function updateComplaint(formData: FormData): Promise<FormResult> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: "Your session has expired. Please sign in again." }
  }
  if (session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Only the customer who filed a complaint can edit it." }
  }

  const id = formData.get("id")?.toString().trim()
  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()

  if (!id) return { ok: false, error: "Missing complaint reference." }
  if (!title || title.length < TITLE_MIN || title.length > TITLE_MAX) {
    return { ok: false, error: `The title needs between ${TITLE_MIN} and ${TITLE_MAX} characters.` }
  }
  if (
    !description ||
    description.length < DESCRIPTION_MIN ||
    description.length > DESCRIPTION_MAX
  ) {
    return {
      ok: false,
      error: `The description needs between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`,
    }
  }

  // Ownership must be a non-empty clause: Prisma drops `undefined`, and an empty
  // object inside OR would match every row.
  const ownership: Record<string, string>[] = [{ customerId: session.user.id }]
  if (session.user.email) ownership.push({ customerEmail: session.user.email })

  try {
    // Ownership and the untouched rule live in the query itself, so nothing can
    // change between checking and writing.
    const { count } = await prisma.complaint.updateMany({
      where: { id, status: "NEW", messages: { none: {} }, OR: ownership },
      data: { title, description },
    })

    if (count === 0) {
      // Either it is not theirs, or staff have already picked it up. Reading the
      // row back only to tell those apart would leak other people's complaints.
      return {
        ok: false,
        error: "This complaint is already being handled, so it can no longer be edited.",
      }
    }
  } catch (error) {
    console.error("updateComplaint failed:", error)
    return { ok: false, error: "Could not save your changes. Please try again." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")
  revalidatePath("/dashboard/my-complaints")
  revalidatePath(`/dashboard/complaints/${id}`)
  return { ok: true, message: "Complaint updated" }
}
