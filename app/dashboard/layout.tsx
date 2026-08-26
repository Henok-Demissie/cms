import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"
import { Search } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { NotificationItem } from "@/components/dashboard/notification-meta"
import {
  NotificationsBell,
  NotificationsDrawerProvider,
} from "@/components/dashboard/notifications-drawer"
import { getCustomerNotifications, getUnreadNotificationCount } from "@/lib/notifications"
import { assertSessionCurrent } from "@/lib/session-guard"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  // A JWT keeps working after its account's password changes, so re-check the
  // session against the database once per dashboard render. Redirects to
  // /logout if the password moved on or the account is gone.
  await assertSessionCurrent(session)

  const isCustomer = session?.user?.role === "CUSTOMER"
  const customerId = isCustomer ? session?.user?.id : undefined

  // Notifications belong to Customer accounts only. Both the count and the list
  // are read here so the header bell, the sidebar row and the account menu can
  // share one drawer.
  const [unreadCount, notificationRecords] = customerId
    ? await Promise.all([
        getUnreadNotificationCount(customerId),
        getCustomerNotifications(customerId, 20),
      ])
    : [0, []]

  const notifications: NotificationItem[] = notificationRecords.map((record) => ({
    id: record.id,
    type: record.type,
    title: record.title,
    message: record.message,
    refType: record.refType,
    refId: record.refId,
    read: record.read,
    createdAt: record.createdAt.toISOString(),
  }))

  return (
    <SidebarProvider>
      <NotificationsDrawerProvider
        notifications={notifications}
        unreadCount={unreadCount}
        enabled={Boolean(customerId)}
      >
        <AppSidebar
          role={session?.user?.role ?? "CUSTOMER"}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          userImage={session?.user?.image}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground md:flex">
              <Search className="h-3.5 w-3.5" />
              <span>Search complaints...</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <NotificationsBell />
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium">{session?.user?.name ?? "Your workspace"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isCustomer ? "Customer portal" : "Staff workspace"}
                </p>
              </div>
            </div>
          </header>
          <main className="compact flex flex-1 flex-col">{children}</main>
        </SidebarInset>
      </NotificationsDrawerProvider>
    </SidebarProvider>
  )
}
