"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck } from "lucide-react"
import { toast } from "sonner"

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/dashboard/notifications/actions"
import {
  formatNotificationTime,
  NotificationIcon,
  notificationTargetUrl,
  type NotificationItem,
} from "@/components/dashboard/notification-meta"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type NotificationsDrawerContextValue = {
  notifications: NotificationItem[]
  unreadCount: number
  enabled: boolean
  openDrawer: () => void
}

const NotificationsDrawerContext =
  React.createContext<NotificationsDrawerContextValue | null>(null)

/**
 * Holds the drawer's open state so the header bell, the sidebar nav row and the
 * account dropdown can all open the same drawer without prop drilling.
 * `enabled` is false for staff, whose accounts have no notifications.
 */
export function useNotificationsDrawer() {
  const context = React.useContext(NotificationsDrawerContext)
  if (!context) {
    throw new Error("useNotificationsDrawer must be used inside <NotificationsDrawerProvider>")
  }
  return context
}

export function NotificationsDrawerProvider({
  notifications,
  unreadCount,
  enabled,
  children,
}: {
  notifications: NotificationItem[]
  unreadCount: number
  enabled: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  const value = React.useMemo<NotificationsDrawerContextValue>(
    () => ({ notifications, unreadCount, enabled, openDrawer: () => setOpen(true) }),
    [notifications, unreadCount, enabled],
  )

  return (
    <NotificationsDrawerContext.Provider value={value}>
      {children}
      {enabled && (
        <NotificationsDrawer
          notifications={notifications}
          unreadCount={unreadCount}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </NotificationsDrawerContext.Provider>
  )
}

/** The bell in the dashboard header. */
export function NotificationsBell({ className }: { className?: string }) {
  const { unreadCount, enabled, openDrawer } = useNotificationsDrawer()

  if (!enabled) return null

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      className={cn(
        "relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  )
}

function NotificationsDrawer({
  notifications,
  unreadCount,
  open,
  onOpenChange,
}: {
  notifications: NotificationItem[]
  unreadCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [pending, startTransition] = React.useTransition()
  const isMobile = useIsMobile()
  const router = useRouter()

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead()
      toast.success("All notifications marked as read")
    })
  }

  function handleMarkOne(notification: NotificationItem) {
    startTransition(async () => {
      await markNotificationRead(notification.id)
    })
  }

  function handleOpenNotification(notification: NotificationItem) {
    onOpenChange(false)
    startTransition(async () => {
      if (!notification.read) await markNotificationRead(notification.id)
      router.push(notificationTargetUrl(notification))
    })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent showHandle={isMobile} className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {unreadCount} new
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription>
            Replies and status changes from the organizations you contacted.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <div className="grid place-items-center px-6 py-14 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">No notifications yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  When staff responds to your complaints or suggestions, alerts appear here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 transition-colors",
                    notification.read
                      ? "border-border bg-card opacity-85"
                      : "border-primary/40 bg-card",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenNotification(notification)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/60">
                      <NotificationIcon type={notification.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-foreground">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            NEW
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[10px] text-muted-foreground/75">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>

                  {!notification.read && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleMarkOne(notification)}
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DrawerFooter>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleMarkAll}
              disabled={pending}
              className="gap-2"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read ({unreadCount})
            </Button>
          )}
          <DrawerClose asChild>
            <Link
              href="/dashboard/notifications"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View all notifications
            </Link>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
