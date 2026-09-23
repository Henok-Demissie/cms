"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function topUpWallet() {
  await getUserId()
  return { ok: false, message: "Wallet funding will be available after secure payment setup is connected." }
}
