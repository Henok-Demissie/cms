"use server"

import { revalidatePath } from "next/cache"
import {
  ensureOwnerAccountExists,
  isOwnerEmail,
  grantAdminRole,
  grantAdminByEmail,
  revokeAdminRole,
  requireAdminOrOwner,
} from "@/lib/owner"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { ne, or, eq } from "drizzle-orm"
import { getOrderStatus } from "@/lib/idatagh"
import { mapProviderStatus } from "@/lib/status"

export async function precheckOwnerLogin(email: string) {
  if (isOwnerEmail(email)) {
    await ensureOwnerAccountExists()
  }
}

export async function grantAdminAction(userId: string) {
  try {
    const res = await grantAdminRole(userId)
    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { success: true, message: `Successfully appointed admin.` }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to appoint admin." }
  }
}

export async function grantAdminByEmailAction(email: string) {
  try {
    const res = await grantAdminByEmail(email)
    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { success: true, message: `Successfully added ${email} as administrator.` }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to appoint admin." }
  }
}

export async function revokeAdminAction(userId: string) {
  try {
    await revokeAdminRole(userId)
    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { success: true, message: `Successfully removed administrator privileges.` }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove administrator." }
  }
}

/**
 * Bulk re-sync every non-delivered order from iDataGH.
 * Fixes orders stuck as "processing" or "failed" that were actually delivered.
 * Owner/admin only.
 */
export async function bulkSyncOrders() {
  await requireAdminOrOwner()

  // Get all orders that aren't delivered yet and have a providerOrderId
  const stuck = await db
    .select()
    .from(orders)
    .where(ne(orders.status, "delivered"))

  let updated = 0
  let errors = 0

  for (const order of stuck) {
    if (!order.providerOrderId) continue
    try {
      const res = await getOrderStatus(order.providerOrderId)
      const newStatus = mapProviderStatus(res.order_status)
      if (newStatus !== order.status) {
        await db
          .update(orders)
          .set({
            status: newStatus,
            providerStatus: res.order_status,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id))
        updated++
      }
    } catch {
      errors++
    }
  }

  revalidatePath("/")
  revalidatePath("/dashboard/orders")
  revalidatePath("/admin")
  revalidatePath("/admin/orders")

  return {
    success: true,
    total: stuck.length,
    updated,
    errors,
    message: `Synced ${stuck.length} orders — ${updated} updated, ${errors} unreachable.`,
  }
}

/**
 * Mark a single order as delivered manually.
 * Admin/Owner only.
 */
export async function markOrderDelivered(orderId: number) {
  try {
    await requireAdminOrOwner()

    await db
      .update(orders)
      .set({
        status: "delivered",
        providerStatus: "manual_delivered",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    revalidatePath("/admin")
    revalidatePath("/admin/orders")

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to mark order as delivered." }
  }
}

/**
 * Mark all currently failed orders as delivered in bulk.
 * Admin/Owner only.
 */
export async function markAllFailedDelivered() {
  try {
    await requireAdminOrOwner()

    const failed = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.status, "failed"))

    if (failed.length === 0) {
      return { success: true, message: "No failed orders found to update." }
    }

    await db
      .update(orders)
      .set({
        status: "delivered",
        providerStatus: "manual_delivered",
        updatedAt: new Date(),
      })
      .where(eq(orders.status, "failed"))

    revalidatePath("/")
    revalidatePath("/dashboard/orders")
    revalidatePath("/admin")
    revalidatePath("/admin/orders")

    return {
      success: true,
      message: `Successfully marked ${failed.length} failed order${failed.length === 1 ? "" : "s"} as delivered.`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update orders." }
  }
}

