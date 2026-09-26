"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { topups } from "@/lib/db/schema"
import { initializePaystackTransaction } from "@/lib/paystack"

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

export async function topUpWallet(amount: number) {
  const user = await getSessionUser()
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) return { ok: false, message: "Enter a valid top-up amount." }
  const reference = `topup_${user.id}_${randomUUID()}`
  await db.insert(topups).values({ userId: user.id, reference, amount: amount.toFixed(2) })
  try {
    const authorizationUrl = await initializePaystackTransaction({
      email: user.email,
      amountGhs: amount,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://cms-virid-iota.vercel.app"}/dashboard/wallet/verify?reference=${encodeURIComponent(reference)}`,
    })
    return { ok: true, authorizationUrl }
  } catch {
    return { ok: false, message: "Payment setup is unavailable. Please try again later." }
  }
}
