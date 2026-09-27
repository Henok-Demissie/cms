"use server"

import { revalidatePath } from "next/cache"
import {
  ensureOwnerAccountExists,
  isOwnerEmail,
  grantAdminRole,
  grantAdminByEmail,
  revokeAdminRole,
} from "@/lib/owner"

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
