"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { formatGhs } from "@/lib/data"
import { getWalletBalance } from "@/app/actions/orders"

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

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; badge?: string }

export function AppSidebar({ balance }: { balance: number }) {
  const pathname = usePathname()
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
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
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
        {renderGroup("Platform", platform)}
        {renderGroup("Grow", grow)}
        {renderGroup("Account", account)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="brand-gradient-soft rounded-lg border border-primary/20 p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Wallet balance</p>
          <p className="mt-0.5 text-lg font-extrabold tabular-nums">{formatGhs(balance)}</p>
          <Link
            href="/dashboard/wallet"
            className="mt-1 inline-block text-xs font-semibold text-brand-emerald hover:underline"
          >
            Top up wallet
          </Link>
        </div>
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
