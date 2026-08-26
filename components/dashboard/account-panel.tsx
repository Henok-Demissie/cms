"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  CalendarDays,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserRound,
} from "lucide-react"

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
import { DEFAULT_LANGUAGE, languageLabel, type LanguageCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/** Everything the panel renders, resolved on the server once per dashboard load. */
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

type AccountPanelContextValue = {
  openAccount: () => void
  /**
   * The signed-in account's saved locale. The account menu's EN/AM picker needs
   * it, and this provider already holds the record it comes from.
   */
  language: LanguageCode
}

const AccountPanelContext = React.createContext<AccountPanelContextValue | null>(null)

/**
 * Opens the Account panel and reads the saved locale.
 *
 * The panel opens centred on the screen, the same overlay complaints and
 * suggestions use, so the account menu never navigates away. Day/night and
 * language are not in here — they live inline in the account menu, since they
 * were the only two things the old Settings panel held.
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
  const [open, setOpen] = React.useState(false)

  const value = React.useMemo<AccountPanelContextValue>(
    () => ({
      openAccount: () => setOpen(true),
      // Falls back when there is no account record to read, so the menu's picker
      // still renders a selected side.
      language: account?.language ?? DEFAULT_LANGUAGE,
    }),
    [account?.language],
  )

  return (
    <AccountPanelContext.Provider value={value}>
      {children}
      {account && <AccountPanel account={account} open={open} onOpenChange={setOpen} />}
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
  open,
  onOpenChange,
}: {
  account: AccountPanelData
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  const initials =
    account.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AB"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Centred, and only as wide as these rows need: as a bottom sheet it
          stretched the full viewport for a handful of controls. */}
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        className="w-[min(92vw,26rem)] p-0"
        // No corner X: the footer already has Close.
        showCloseButton={false}
        // Radix focuses the first control on open, which lands a focus ring on a
        // row as if it had just been picked. Park focus on the panel itself so it
        // still traps and Escape still closes.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.focus()
        }}
      >
        <div className="border-b border-border px-4 py-3">
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" />
            Account
          </DialogTitle>
          <DialogDescription className="mt-0.5">
            Your identity, contact details and session.
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

          <div className="grid gap-2">
            <DetailRow icon={Mail} label="Email" value={account.email} />
            <DetailRow icon={Phone} label="Phone" value={account.phone || "Not added"} />
            <DetailRow icon={Shield} label="Role" value={roleLabel(account.role)} />
            <DetailRow icon={Globe} label="Language" value={languageLabel(account.language)} />
            {account.joined && (
              <DetailRow icon={CalendarDays} label="Member since" value={account.joined} />
            )}
          </div>

          {/* No Settings or Notifications rows: day/night and language are in the
              account menu now, and the header bell is the one way to notifications. */}
          <div className="grid gap-2">
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
