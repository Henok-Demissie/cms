"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatGhs } from "@/lib/data"
import { getWalletBalance } from "@/app/actions/orders"
import {
  ArrowLeft,
  ClipboardList,
  Code2,
  Gift,
  Headset,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Store,
  User,
  Wallet,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const platform = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/buy", label: "Buy Data", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
]

const grow = [
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/agent", label: "Agent Store", icon: Store },
  { href: "/developers", label: "Developer API", icon: Code2 },
]

const account = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/track", label: "Track Order", icon: Search },
  { href: "/dashboard/support", label: "Support", icon: Headset },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

import { ShieldCheck } from "lucide-react"
import { useSession } from "@/lib/auth-client"

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; badge?: string }

export function AppSidebar({
  isOwner,
  hasAdminAccess,
  walletBalance: initialBalance,
}: {
  isOwner?: boolean
  hasAdminAccess?: boolean
  walletBalance?: number
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [balance, setBalance] = useState<number | undefined>(initialBalance)

  useEffect(() => {
    if (initialBalance !== undefined) {
      setBalance(initialBalance)
    }
  }, [initialBalance])

  useEffect(() => {
    let active = true
    getWalletBalance()
      .then((b) => {
        if (active) setBalance(b)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [pathname])

  const isPrimaryOwner = Boolean(
    isOwner || (session?.user?.email && session.user.email.toLowerCase() === "pboxtv9@gmail.com")
  )
  const canAccessAdmin = Boolean(isPrimaryOwner || hasAdminAccess)

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/")

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <Logo href="/dashboard" size="sm" />
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <Logo href="/dashboard" size="sm" markOnly />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {canAccessAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Admin & Control</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin" || pathname.startsWith("/admin/")}
                    tooltip={isPrimaryOwner ? "Owner Console (/admin)" : "Admin Console (/admin)"}
                    className={
                      isPrimaryOwner
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/20"
                    }
                  >
                    <Link href="/admin" className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`size-4 ${isPrimaryOwner ? "text-amber-500" : "text-blue-500"}`}
                        />
                        <span>{isPrimaryOwner ? "Owner Console" : "Admin Console"}</span>
                      </div>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          isPrimaryOwner
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {isPrimaryOwner ? "Owner" : "Admin"}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {renderGroup("Platform", platform)}
        {renderGroup("Grow", grow)}
        {renderGroup("Account", account)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Real wallet balance button */}
        <Link
          href="/dashboard/wallet"
          className="brand-gradient-soft block rounded-xl border border-primary/20 p-3 transition-all hover:border-brand-emerald/40 hover:shadow-sm group-data-[collapsible=icon]:hidden group/wallet"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet</p>
            <span className="text-[10px] font-semibold text-brand-emerald group-hover/wallet:underline">Manage →</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black tracking-tight text-foreground font-mono">
              {balance !== undefined ? formatGhs(balance) : "GHS 0.00"}
            </span>
          </div>
        </Link>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to home">
              <Link href="/">
                <ArrowLeft />
                <span>Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
