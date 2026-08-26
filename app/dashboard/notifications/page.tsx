import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Check, CheckCheck, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./actions";
import {
  NotificationIcon,
  notificationTargetUrl,
} from "@/components/dashboard/notification-meta";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isCustomer = session.user.role === "CUSTOMER";
  if (!isCustomer) {
    redirect("/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Customer Alerts
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with replies and status changes from organizations you contacted.
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read ({unreadCount})
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-semibold">No notifications yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            When staff responds to your complaints or suggestions, you will see alerts here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const targetUrl = notificationTargetUrl(n);
            return (
              <div
                key={n.id}
                className={`relative flex flex-col justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center ${
                  n.read
                    ? "border-border bg-card text-card-foreground opacity-85"
                    : "border-primary/40 bg-card shadow-[0_2px_10px_-4px_var(--primary)]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/60">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.read && (
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/75">
                      <Clock className="h-3 w-3" />
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!n.read && (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  )}
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
