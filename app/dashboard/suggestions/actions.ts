"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function submitSuggestion(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") throw new Error("Only customers can submit suggestions.")

  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  if (!title || !description) throw new Error("A title and suggestion are required.")

  await prisma.$executeRawUnsafe(
    'INSERT INTO "Suggestion" ("id", "tenantId", "authorId", "title", "description", "status", "createdAt") VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    randomUUID(), session.user.tenantId, session.user.id, title, description, "NEW",
  )
  revalidatePath("/dashboard/suggestions")
}
