import { Bell, Lightbulb, MessageSquare, Star } from "lucide-react"

export type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  refType: string | null
  refId: string | null
  read: boolean
  /** ISO string — Date instances are avoided so this crosses the client boundary cleanly. */
  createdAt: string
}

export function NotificationIcon({ type, className = "h-4 w-4" }: { type: string; className?: string }) {
  switch (type) {
    case "COMPLAINT_REPLY":
      return <MessageSquare className={`${className} text-blue-400`} />
    case "SUGGESTION_RESPONSE":
      return <Lightbulb className={`${className} text-amber-400`} />
    case "FEEDBACK_RESPONSE":
      return <Star className={`${className} text-purple-400`} />
    default:
      return <Bell className={`${className} text-primary`} />
  }
}

export function notificationTargetUrl(notification: Pick<NotificationItem, "refType" | "refId">) {
  if (notification.refType === "COMPLAINT" && notification.refId) {
    return `/dashboard/complaints/${notification.refId}`
  }
  if (notification.refType === "SUGGESTION") return "/dashboard/suggestions"
  if (notification.refType === "FEEDBACK") return "/dashboard/feedback"
  return "/dashboard"
}

export function formatNotificationTime(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en", { month: "short", day: "numeric" })
}
