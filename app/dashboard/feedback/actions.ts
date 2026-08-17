"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function submitFeedback(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") throw new Error("Only customers can submit feedback.")
  const message = formData.get("message")?.toString().trim()
  const rating = Number(formData.get("rating"))
  if (!message) throw new Error("Feedback is required.")
  await prisma.$executeRawUnsafe(
    'INSERT INTO "Feedback" ("id", "tenantId", "authorId", "message", "rating", "createdAt") VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    randomUUID(), session.user.tenantId, session.user.id, message, Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
  )
  revalidatePath("/dashboard/feedback")
}
