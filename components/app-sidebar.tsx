"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, BookOpen, CircleHelp, ClipboardList, Lightbulb, LayoutDashboard, LogOut, MessageSquareHeart, MessageSquareText, Send, UserRound, type LucideIcon } from "lucide-react"
import { signOut } from "next-auth/react"
import type { UserRole } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

type NavItem = { title: string; href: string; icon: LucideIcon; badge?: string }

const customerGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { label: "Services", items: [
    { title: "Submit Complaint", href: "/dashboard/complaints", icon: Send, badge: "Primary" },
    { title: "My Complaints", href: "/dashboard/my-complaints", icon: ClipboardList },
    { title: "Suggestions", href: "/dashboard/suggestions", icon: Lightbulb },
    { title: "Feedback", href: "/dashboard/feedback", icon: MessageSquareHeart },
  ] },
  { label: "Resources", items: [
    { title: "Service Catalog", href: "/dashboard/service-catalog", icon: BookOpen },
    { title: "Help & FAQ", href: "/dashboard/help", icon: CircleHelp },
  ] },
  { label: "Account", items: [
    { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { title: "My Profile", href: "/dashboard/profile", icon: UserRound },
  ] },
]

const staffGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { label: "Workspace", items: [
    { title: "Complaints", href: "/dashboard/complaints", icon: MessageSquareText, badge: "Review" },
    { title: "Suggestions", href: "/dashboard/suggestions", icon: Lightbulb, badge: "Review" },
    { title: "Feedback", href: "/dashboard/feedback", icon: MessageSquareHeart },
    { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { title: "My Profile", href: "/dashboard/profile", icon: UserRound },
  ] },
]

export function AppSidebar({
  role,
  userName,
  userEmail,
  unreadNotifications = 0,
}: {
  role: UserRole
  userName?: string | null
  userEmail?: string | null
  unreadNotifications?: number
}) {
  const pathname = usePathname()
  const customer = role === "CUSTOMER"
  const initials = (userName || "User").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()

  const groups = (customer ? customerGroups : staffGroups).map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.href === "/dashboard/notifications" && unreadNotifications > 0) {
        return { ...item, badge: `${unreadNotifications}` }
      }
      return item
    }),
  }))

  return (
    <Sidebar side="left" collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shadow-[0_8px_20px_-8px_var(--sidebar-primary)] transition-transform duration-200 hover:scale-105">
            AB
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">AbetBay</p>
            <p className="text-[10px] text-muted-foreground">{customer ? "Customer portal" : "Staff workspace"}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-0 py-0.5">
            <SidebarGroupLabel className="h-auto px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="h-9 rounded-lg px-2.5 text-sidebar-foreground transition-[transform,colors,box-shadow] duration-200 ease-out hover:translate-x-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[0_8px_20px_-10px_var(--sidebar-primary)]"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <Icon className="h-4 w-4 transition-transform duration-200 group-hover/menu-button:scale-110" />
                          <span className="flex-1 text-[13px]">{item.title}</span>
                          {item.badge && (
                            <span className={cn(
                              "rounded-full px-1.5 py-0.5 text-[8px] font-semibold transition-colors duration-200",
                              active ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" : "bg-primary/15 text-primary"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-sidebar-primary text-[9px] font-bold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-sidebar-foreground">{userName || "Account"}</p>
            <p className="truncate text-[9px] text-muted-foreground">{userEmail || "Signed in"}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="rounded p-1 text-muted-foreground transition-all duration-200 hover:scale-110 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
