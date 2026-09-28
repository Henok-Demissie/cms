"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { desc, eq, gte } from "drizzle-orm"

export type AppNotification = {
  id: string
  title: string
  body: string
  status: "delivered" | "failed" | "processing" | "pending"
  reference: string
  createdAt: string
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  // Use orders from the last 7 days as notification source
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.updatedAt))
    .limit(20)

  // Only show orders that have a noteworthy status (not still processing silently)
  return rows
    .filter((o) => ["delivered", "failed", "processing"].includes(o.status))
    .map((o) => {
      const label = `${o.network.toUpperCase()} ${o.volume}`
      let title = ""
      let body = ""

      if (o.status === "delivered") {
        title = `${label} delivered ✓`
        body = `Your data bundle to ${o.recipient} was sent successfully.`
      } else if (o.status === "failed") {
        title = `${label} failed`
        body = `Delivery failed${o.failureReason ? `: ${o.failureReason}` : ""}. Your wallet was refunded.`
      } else {
        title = `${label} processing…`
        body = `Your order to ${o.recipient} is being processed.`
      }

      return {
        id: String(o.id),
        title,
        body,
        status: o.status as AppNotification["status"],
        reference: o.reference,
        createdAt: (o.updatedAt as unknown as Date).toISOString(),
      }
    })
}
