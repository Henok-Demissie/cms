"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { FormResult } from "@/lib/form-result"
import { isSupportedLanguage } from "@/lib/languages"

/**
 * Persists the account's preferred locale. The preference is stored only — the
 * dashboard copy is not translated yet, so nothing else reads it at render time.
 */
export async function updateLanguage(language: string): Promise<FormResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Please sign in again." }
  }

  if (!isSupportedLanguage(language)) {
    return { ok: false, error: "That language is not supported." }
  }

  try {
    if (session.user.role === "CUSTOMER") {
      await prisma.customer.update({ where: { id: session.user.id }, data: { language } })
    } else {
      await prisma.user.update({ where: { id: session.user.id }, data: { language } })
    }
  } catch (error) {
    console.error("updateLanguage failed:", error)
    return { ok: false, error: "Could not save your language preference. Please try again." }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/profile")
  return { ok: true, message: "Language preference saved" }
}
