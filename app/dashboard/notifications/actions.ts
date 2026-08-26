"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/notifications"

// The unread count and the drawer's list are both read in the dashboard layout,
// so every mutation has to revalidate the layout rather than a single page.
function revalidateDashboard() {
  revalidatePath("/dashboard", "layout")
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) return
  await markAllNotificationsAsRead(session.user.id)
  revalidateDashboard()
}

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await markNotificationAsRead(id, session.user.id)
  revalidateDashboard()
}

/** Form-action wrapper for the no-JS path on /dashboard/notifications. */
export async function markAllNotificationsReadAction() {
  await markAllNotificationsRead()
}

/** Form-action wrapper for the no-JS path on /dashboard/notifications. */
export async function markNotificationReadAction(formData: FormData) {
  const id = formData.get("id")?.toString()
  if (id) await markNotificationRead(id)
}
