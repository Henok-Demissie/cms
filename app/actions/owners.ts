"use server"

import { revalidatePath } from "next/cache"
import { revokeAccount } from "@/lib/owner"

export async function revokeOwnerAccount(userId: string) {
  await revokeAccount(userId)
  revalidatePath("/dashboard/owners")
}
