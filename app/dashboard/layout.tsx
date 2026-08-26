import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { NotificationItem } from "@/components/dashboard/notification-meta"
import {
  AccountDrawerProvider,
  type AccountDrawerData,
} from "@/components/dashboard/account-drawer"
import {
  NotificationsBell,
  NotificationsDrawerProvider,
} from "@/components/dashboard/notifications-drawer"
import { getCustomerNotifications, getUnreadNotificationCount } from "@/lib/notifications"
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/lib/languages"
import { prisma } from "@/lib/prisma"
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

  // Started before the notifications await below so both queries are in flight
  // together. Feeds the Account and Settings drawers.
  const accountPromise = session?.user?.id
    ? isCustomer
      ? prisma.customer.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true, phone: true, language: true, createdAt: true },
        })
      : prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true, phone: true, language: true, createdAt: true },
        })
    : null

  // Notifications belong to Customer accounts only. Both the count and the list
  // are read here so the header bell, the sidebar row and the account menu can
  // share one drawer.
  const [unreadCount, notificationRecords] = customerId
    ? await Promise.all([
        getUnreadNotificationCount(customerId),
        getCustomerNotifications(customerId, 20),
      ])
    : [0, []]

  const accountRecord = await accountPromise

  const account: AccountDrawerData | null = accountRecord
    ? {
        name: accountRecord.name || session?.user?.name || "Account",
        email: accountRecord.email || session?.user?.email || "Signed in",
        image: session?.user?.image,
        role: session?.user?.role ?? "CUSTOMER",
        phone: accountRecord.phone,
        language: isSupportedLanguage(accountRecord.language)
          ? accountRecord.language
          : DEFAULT_LANGUAGE,
        joined: new Intl.DateTimeFormat("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(accountRecord.createdAt),
      }
    : null

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

  // The trigger writes a `sidebar_state` cookie, so read it back here to keep a
  // collapsed sidebar collapsed across a full page reload.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <NotificationsDrawerProvider
        notifications={notifications}
        unreadCount={unreadCount}
        enabled={Boolean(customerId)}
      >
        <AccountDrawerProvider account={account}>
          <AppSidebar
            role={session?.user?.role ?? "CUSTOMER"}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
            userImage={session?.user?.image}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur md:px-6">
              {/* Collapses the sidebar on desktop, opens it as a sheet on mobile. */}
              <SidebarTrigger
                title="Toggle sidebar (Ctrl+B)"
                className="size-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground [&>svg]:size-4"
              />
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
        </AccountDrawerProvider>
      </NotificationsDrawerProvider>
    </SidebarProvider>
  )
}
