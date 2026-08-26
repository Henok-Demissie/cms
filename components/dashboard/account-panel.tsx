"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Settings2,
  Shield,
  UserRound,
} from "lucide-react"

import { AppearanceSetting } from "@/components/dashboard/appearance-setting"
import { LanguageSetting } from "@/components/dashboard/language-setting"
import { useNotificationsDrawer } from "@/components/dashboard/notifications-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { languageLabel, type LanguageCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/** Everything the two panels render, resolved on the server once per dashboard load. */
export type AccountPanelData = {
  name: string
  email: string
  image?: string | null
  role: string
  phone?: string | null
  language: LanguageCode
  /** Pre-formatted on the server so the panel renders the same date on both sides. */
  joined: string | null
}

type Panel = "account" | "settings"

type AccountPanelContextValue = {
  openAccount: () => void
  openSettings: () => void
}

const AccountPanelContext = React.createContext<AccountPanelContextValue | null>(null)

/**
 * Opens the Account and Settings panels. Both open centred on the screen, the
 * same overlay complaints and suggestions use, so the account menu never
 * navigates away.
 */
export function useAccountPanel() {
  const context = React.useContext(AccountPanelContext)
  if (!context) {
    throw new Error("useAccountPanel must be used inside <AccountPanelProvider>")
  }
  return context
}

function roleLabel(role: string) {
  if (role === "CUSTOMER") return "Customer"
  if (role === "ADMIN") return "Administrator"
  return "Agent"
}

const rowClassName =
  "flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function AccountPanelProvider({
  account,
  children,
}: {
  account: AccountPanelData | null
  children: React.ReactNode
}) {
  const [panel, setPanel] = React.useState<Panel | null>(null)

  const value = React.useMemo<AccountPanelContextValue>(
    () => ({
      openAccount: () => setPanel("account"),
      openSettings: () => setPanel("settings"),
    }),
    [],
  )

  return (
    <AccountPanelContext.Provider value={value}>
      {children}
      {account && <AccountPanel account={account} panel={panel} onPanelChange={setPanel} />}
    </AccountPanelContext.Provider>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto min-w-0 truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}

function AccountPanel({
  account,
  panel,
  onPanelChange,
}: {
  account: AccountPanelData
  panel: Panel | null
  onPanelChange: (panel: Panel | null) => void
}) {
  const { enabled: notificationsEnabled, unreadCount, openDrawer } = useNotificationsDrawer()
  const contentRef = React.useRef<HTMLDivElement>(null)

  const settings = panel === "settings"
  const initials =
    account.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AB"

  function handleNotifications() {
    onPanelChange(null)
    // Let this overlay finish closing before the notifications drawer mounts, so
    // focus is not handed between two of them at once.
    window.setTimeout(openDrawer, 220)
  }

  return (
    <Dialog
      open={panel !== null}
      onOpenChange={(next) => {
        if (!next) onPanelChange(null)
      }}
    >
      {/* Centred, and only as wide as these rows need: as a bottom sheet it
          stretched the full viewport for a handful of controls. */}
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        className="w-[min(92vw,26rem)] p-0"
        // Radix focuses the first control on open, which lands a focus ring on a
        // language segment as if it had just been picked. Park focus on the panel
        // itself so it still traps and Escape still closes.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.focus()
        }}
      >
        <div className="border-b border-border px-4 py-3 pr-10">
          <DialogTitle className="flex items-center gap-2">
            {settings ? (
              <Settings2 className="h-4 w-4 text-primary" />
            ) : (
              <UserRound className="h-4 w-4 text-primary" />
            )}
            {settings ? "Settings" : "Account"}
          </DialogTitle>
          <DialogDescription className="mt-0.5">
            {settings
              ? "Language and day / night mode."
              : "Your identity, contact details and session."}
          </DialogDescription>
        </div>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto px-4 py-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Avatar className="size-10 rounded-lg">
              {account.image ? <AvatarImage src={account.image} alt={account.name} /> : null}
              <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 gap-0.5 leading-tight">
              <span className="truncate text-sm font-medium">{account.name}</span>
              <span className="truncate text-xs text-muted-foreground">{account.email}</span>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {roleLabel(account.role)}
            </Badge>
          </div>

          {settings ? (
            <>
              {/* No "Language" or "Appearance" headings: the two language names
                  and the night mode row already say what they are. */}
              <LanguageSetting defaultValue={account.language} />
              <AppearanceSetting />

              <button
                type="button"
                onClick={() => onPanelChange("account")}
                className={rowClassName}
              >
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Account</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <DetailRow icon={Mail} label="Email" value={account.email} />
                <DetailRow icon={Phone} label="Phone" value={account.phone || "Not added"} />
                <DetailRow icon={Shield} label="Role" value={roleLabel(account.role)} />
                <DetailRow icon={Globe} label="Language" value={languageLabel(account.language)} />
                {account.joined && (
                  <DetailRow icon={CalendarDays} label="Member since" value={account.joined} />
                )}
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => onPanelChange("settings")}
                  className={rowClassName}
                >
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">Settings</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                {notificationsEnabled && (
                  <button type="button" onClick={handleNotifications} className={rowClassName}>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}

                {/* Name and phone are only editable on the full page, so keep a
                    way in from here. */}
                <DialogClose asChild>
                  <Link href="/dashboard/profile" className={rowClassName}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Edit full profile</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DialogClose>

                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className={cn(rowClassName, "text-destructive hover:bg-destructive/10")}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="flex-1">Log out</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
