"use client"

import Link from "next/link"
import { Bell, ChevronRight, LogOut, UserRound } from "lucide-react"
import { signOut } from "next-auth/react"

import { useNotificationsDrawer } from "@/components/dashboard/notifications-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const rowClassName =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

/**
 * Account panel for the settings page. Mirrors the sidebar account menu — identity
 * header plus Account / Notifications / Log out. Billing is intentionally absent.
 */
export function AccountSetting({
  userName,
  userEmail,
  userImage,
  roleLabel,
}: {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  roleLabel: string
}) {
  const { enabled: notificationsEnabled, unreadCount, openDrawer } = useNotificationsDrawer()

  const name = userName || "Account"
  const email = userEmail || "Signed in"
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AB"

  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Avatar className="size-10 rounded-lg">
          {userImage ? <AvatarImage src={userImage} alt={name} /> : null}
          <AvatarFallback className="rounded-lg bg-primary/15 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 gap-0.5 leading-tight">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {roleLabel}
        </Badge>
      </div>

      <div className="mt-1 grid gap-0.5">
        <Link href="/dashboard/profile" className={rowClassName}>
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Account</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        {notificationsEnabled && (
          <button type="button" onClick={openDrawer} className={rowClassName}>
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center px-1.5 text-[10px]">{unreadCount}</Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className={cn(rowClassName, "text-destructive hover:bg-destructive/10")}
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1">Log out</span>
        </button>
      </div>
    </div>
  )
}
