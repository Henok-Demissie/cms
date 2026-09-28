"use server"

import { revalidatePath } from "next/cache"
import {
  ensureOwnerAccountExists,
  isOwnerEmail,
  grantAdminRole,
  grantAdminByEmail,
  revokeAdminRole,
  requireAdminOrOwner,
  purgeFailedTestErrorsAndResetFloat,
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
 * Manually trigger purge of test error orders and reset customer float to real deposits.
 */
export async function clearTestErrorsAction() {
  await requireAdminOrOwner()
  const res = await purgeFailedTestErrorsAndResetFloat()
  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/orders")
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath("/admin/users")
  return {
    success: true,
    message: `Cleared ${res.count} test orders and updated customer float to real deposits only.`,
  }
}


