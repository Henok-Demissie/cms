import { prisma } from "@/lib/prisma"

export type CreateNotificationParams = {
  customerId: string
  type: "COMPLAINT_REPLY" | "STATUS_UPDATE" | "SUGGESTION_RESPONSE" | "FEEDBACK_RESPONSE" | "SYSTEM"
  title: string
  message: string
  refType?: "COMPLAINT" | "SUGGESTION" | "FEEDBACK"
  refId?: string
}

export async function createCustomerNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        customerId: params.customerId,
        type: params.type,
        title: params.title,
        message: params.message,
        refType: params.refType,
        refId: params.refId,
        read: false,
      },
    })
  } catch (error) {
    console.error("Failed to create customer notification:", error)
    return null
  }
}

export async function getCustomerNotifications(customerId: string, take: number = 20) {
  return prisma.notification.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take,
  })
}

export async function getUnreadNotificationCount(customerId: string) {
  return prisma.notification.count({
    where: { customerId, read: false },
  })
}

export async function markNotificationAsRead(id: string, customerId: string) {
  return prisma.notification.updateMany({
    where: { id, customerId },
    data: { read: true },
  })
}

export async function markAllNotificationsAsRead(customerId: string) {
  return prisma.notification.updateMany({
    where: { customerId, read: false },
    data: { read: true },
  })
}
