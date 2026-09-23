"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateProfile(input: { name: string; phone: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, message: "You must be signed in." }

  const name = input.name.trim()
  const phone = input.phone.trim()
  if (name.length < 2) return { ok: false, message: "Enter your full name." }
  if (!/^0\d{9}$/.test(phone.replace(/\s/g, ""))) {
    return { ok: false, message: "Enter a valid 10-digit Ghana phone number." }
  }

  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, session.user.id))
  revalidatePath("/dashboard/profile")
  return { ok: true, message: "Profile saved." }
}
