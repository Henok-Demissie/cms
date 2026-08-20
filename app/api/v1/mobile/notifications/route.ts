import { z } from "zod"

import { apiError, apiSuccess } from "@/lib/api/response"
import { requireApiUser } from "@/lib/api/mobile-auth"
import {
  getCustomerNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request)
    if (user.role !== "CUSTOMER" && user.accountType !== "customer") {
      return apiError("Notifications are for customer accounts", 403)
    }

    const [notifications, unreadCount] = await Promise.all([
      getCustomerNotifications(user.id, 50),
      getUnreadNotificationCount(user.id),
    ])

    return apiSuccess({ notifications, unreadCount })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to load notifications", 500)
  }
}

const patchSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
})

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser(request)
    if (user.role !== "CUSTOMER" && user.accountType !== "customer") {
      return apiError("Notifications are for customer accounts", 403)
    }

    const body = await request.json().catch(() => ({}))
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return apiError("Invalid payload", 400)

    if (parsed.data.all) {
      await markAllNotificationsAsRead(user.id)
    } else if (parsed.data.id) {
      await markNotificationAsRead(parsed.data.id, user.id)
    } else {
      await markAllNotificationsAsRead(user.id)
    }

    const unreadCount = await getUnreadNotificationCount(user.id)
    return apiSuccess({ success: true, unreadCount })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Authentication required", 401)
    return apiError("Unable to update notifications", 500)
  }
}
