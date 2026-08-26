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
  Palette,
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { languageLabel, type LanguageCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/** Everything the two panels render, resolved on the server once per dashboard load. */
export type AccountDrawerData = {
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

type AccountDrawerContextValue = {
  openAccount: () => void
  openSettings: () => void
}

const AccountDrawerContext = React.createContext<AccountDrawerContextValue | null>(null)

/**
 * Opens the Account and Settings panels. Both live in the drawer that the
 * notifications panel uses, so the account menu never navigates away.
 */
export function useAccountDrawer() {
  const context = React.useContext(AccountDrawerContext)
  if (!context) {
    throw new Error("useAccountDrawer must be used inside <AccountDrawerProvider>")
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

/** The sheet spans the viewport, so centre a column inside it on wide screens. */
const columnClassName = "mx-auto w-full max-w-lg"

export function AccountDrawerProvider({
  account,
  children,
}: {
  account: AccountDrawerData | null
  children: React.ReactNode
}) {
  const [panel, setPanel] = React.useState<Panel | null>(null)

  const value = React.useMemo<AccountDrawerContextValue>(
    () => ({
      openAccount: () => setPanel("account"),
      openSettings: () => setPanel("settings"),
    }),
    [],
  )

  return (
    <AccountDrawerContext.Provider value={value}>
      {children}
      {account && (
        <AccountDrawer
          account={account}
          panel={panel}
          onPanelChange={setPanel}
        />
      )}
    </AccountDrawerContext.Provider>
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

function PanelSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function AccountDrawer({
  account,
  panel,
  onPanelChange,
}: {
  account: AccountDrawerData
  panel: Panel | null
  onPanelChange: (panel: Panel | null) => void
}) {
  const { enabled: notificationsEnabled, unreadCount, openDrawer } = useNotificationsDrawer()

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
    // Two vaul drawers must not overlap, so let this one finish its exit
    // animation before the notifications drawer mounts.
    window.setTimeout(openDrawer, 260)
  }

  return (
    <Drawer
      open={panel !== null}
      onOpenChange={(next) => {
        if (!next) onPanelChange(null)
      }}
    >
      {/* Bottom sheet with a swipe handle on every screen size, so these two
          panels read differently from the side drawer notifications use. */}
      <DrawerContent showHandle>
        <DrawerHeader>
          <div className={cn(columnClassName, "flex flex-col gap-1")}>
            <DrawerTitle className="flex items-center gap-2">
              {settings ? (
                <Settings2 className="h-4 w-4 text-primary" />
              ) : (
                <UserRound className="h-4 w-4 text-primary" />
              )}
              {settings ? "Settings" : "Account"}
            </DrawerTitle>
            <DrawerDescription>
              {settings
                ? "Pick your language and switch between day and night mode."
                : "Your identity, contact details and session."}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div className={cn(columnClassName, "min-h-0 flex-1 space-y-4 overflow-y-auto p-4")}>
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
              <PanelSection
                icon={Globe}
                title="Language"
                description="The language saved on your account."
              >
                <LanguageSetting defaultValue={account.language} />
              </PanelSection>

              <PanelSection
                icon={Palette}
                title="Appearance"
                description="Switch between day and night mode."
              >
                <AppearanceSetting />
              </PanelSection>

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
                    way in now that the footer is just a close button. */}
                <DrawerClose asChild>
                  <Link href="/dashboard/profile" className={rowClassName}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Edit full profile</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DrawerClose>

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

        <DrawerFooter>
          <DrawerClose asChild>
            <Button className={columnClassName}>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
