"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Bell, CheckCircle2, Loader2, Package, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getMyNotifications, type AppNotification } from "@/app/actions/notifications"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StatusIcon({ status }: { status: AppNotification["status"] }) {
  if (status === "delivered")
    return <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
  if (status === "failed")
    return <XCircle className="size-4 shrink-0 text-destructive" />
  return <Package className="size-4 shrink-0 text-amber-500 animate-pulse" />
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Load notifications when dropdown opens for the first time, or on re-open
  useEffect(() => {
    if (!open) return
    startTransition(async () => {
      const data = await getMyNotifications()
      setItems(data)
      setLoaded(true)
    })
  }, [open])

  const unread = items.filter((n) => n.status === "failed" || n.status === "delivered").length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
        >
          <Bell />
          {/* Badge — shown when there are unread items */}
          {unread > 0 && (
            <span
              aria-label={`${unread} notifications`}
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-white ring-2 ring-background"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          {/* Fallback dot before loaded */}
          {!loaded && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold">Notifications</span>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          {!isPending && loaded && (
            <span className="text-xs text-muted-foreground">{items.length} recent</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        {/* Loading skeleton */}
        {isPending && (
          <div className="flex flex-col gap-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 size-4 shrink-0 rounded-full bg-muted animate-pulse" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-full rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isPending && loaded && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Bell className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              Order updates will appear here.
            </p>
          </div>
        )}

        {/* Notification items */}
        {!isPending && items.length > 0 && (
          <div className="max-h-[340px] overflow-y-auto">
            {items.map((n, idx) => (
              <div key={n.id}>
                <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 focus:bg-muted/60">
                  <Link href="/dashboard/orders" className="flex items-start gap-3">
                    <StatusIcon status={n.status} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold leading-snug">
                        {n.title}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                        {n.reference} · {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {idx < items.length - 1 && <DropdownMenuSeparator className="my-0" />}
              </div>
            ))}
          </div>
        )}

        <DropdownMenuSeparator className="my-0" />
        <div className="px-4 py-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
          >
            <Link href="/dashboard/orders">View all orders →</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
