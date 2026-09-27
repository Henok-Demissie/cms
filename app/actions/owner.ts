"use server"

import { ensureOwnerAccountExists, isOwnerEmail } from "@/lib/owner"

export async function precheckOwnerLogin(email: string) {
  if (isOwnerEmail(email)) {
    await ensureOwnerAccountExists()
  }
}
