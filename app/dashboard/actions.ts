"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Delete actions for anything a user submitted: complaints, suggestions, feedback.
//
// Ownership is baked into the delete query itself rather than checked first, so
// there is no window between "is this yours?" and "erase it". A customer may
// only remove rows they authored; staff may only remove rows belonging to their
// own tenant.
//
// These return a result object instead of throwing. A thrown server action
// surfaces as a generic error digest in production, which tells the user
// nothing; returning the reason lets the button render it inline.

type DeleteResult = { ok: boolean; error?: string }

function refreshSubmissionPages() {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")
  revalidatePath("/dashboard/my-complaints")
  revalidatePath("/dashboard/suggestions")
  revalidatePath("/dashboard/feedback")
  revalidatePath("/dashboard/notifications")
}

/**
 * Ownership clauses for a customer's own rows.
 *
 * Every clause must be non-empty: Prisma strips `undefined` values, and an empty
 * object inside `OR` matches every row — which on a delete would erase other
 * people's submissions. So an email clause is only added when there is an email.
 */
function customerOwnership(
  userId: string,
  email: string | null | undefined,
  emailField: "customerEmail" | "authorEmail",
  extraIdField?: "authorId",
) {
  const clauses: Record<string, string>[] = [{ customerId: userId }]
  if (extraIdField) clauses.push({ [extraIdField]: userId })
  if (email) clauses.push({ [emailField]: email })
  return clauses
}

export async function deleteComplaint(id: string): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: "You are not signed in." }

  const where =
    session.user.role === "CUSTOMER"
      ? { id, OR: customerOwnership(session.user.id, session.user.email, "customerEmail") }
      : { id, tenantId: session.user.tenantId }

  // Messages and reactions cascade on the FK, so no manual cleanup is needed.
  const { count } = await prisma.complaint.deleteMany({ where })
  if (count === 0) {
    return { ok: false, error: "This complaint no longer exists, or it is not yours to delete." }
  }

  refreshSubmissionPages()
  revalidatePath(`/dashboard/complaints/${id}`)
  return { ok: true }
}

export async function deleteSuggestion(id: string): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: "You are not signed in." }

  const where =
    session.user.role === "CUSTOMER"
      ? { id, OR: customerOwnership(session.user.id, session.user.email, "authorEmail", "authorId") }
      : { id, tenantId: session.user.tenantId }

  const { count } = await prisma.suggestion.deleteMany({ where })
  if (count === 0) {
    return { ok: false, error: "This suggestion no longer exists, or it is not yours to delete." }
  }

  refreshSubmissionPages()
  return { ok: true }
}

export async function deleteFeedback(id: string): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: "You are not signed in." }

  const where =
    session.user.role === "CUSTOMER"
      ? { id, OR: customerOwnership(session.user.id, session.user.email, "authorEmail", "authorId") }
      : { id, tenantId: session.user.tenantId }

  const { count } = await prisma.feedback.deleteMany({ where })
  if (count === 0) {
    return { ok: false, error: "This feedback no longer exists, or it is not yours to delete." }
  }

  refreshSubmissionPages()
  return { ok: true }
}
