"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
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
  ClipboardList,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/buy", label: "Buy Data", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/agent", label: "Agent Store", icon: Store },
  { href: "/developers", label: "Developer API", icon: Code2 },
]

const secondaryNav = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/track", label: "Track Order", icon: Search },
  { href: "/dashboard/support", label: "Support", icon: Headset },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
        />
      )}
      <Icon className={cn("size-[18px] shrink-0", active ? "text-brand-emerald" : "text-muted-foreground")} />
      <span>{label}</span>
    </Link>
  )
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/")

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5 lg:hidden">
        <Logo size="sm" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
        <div className="my-3 h-px bg-sidebar-border" role="separator" />
        {secondaryNav.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <ArrowLeft className="size-[18px] text-muted-foreground" />
          Back to Home
        </Link>
      </div>
    </aside>
  )
}
