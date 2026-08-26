"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, CircleHelp, ClipboardList, Lightbulb, LayoutDashboard, MessageSquareHeart, MessageSquareText, type LucideIcon } from "lucide-react"
import type { UserRole } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { NavUser } from "@/components/dashboard/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

type NavItem = { title: string; href: string; icon: LucideIcon; badge?: string }

// Notifications, profile and settings live in the account menu in the footer, so
// the nav groups below deliberately don't repeat them.
const customerGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { label: "Services", items: [
    { title: "My Complaints", href: "/dashboard/my-complaints", icon: ClipboardList },
    { title: "Suggestions", href: "/dashboard/suggestions", icon: Lightbulb },
    { title: "Feedback", href: "/dashboard/feedback", icon: MessageSquareHeart },
  ] },
  { label: "Resources", items: [
    { title: "Service Catalog", href: "/dashboard/service-catalog", icon: BookOpen },
    { title: "Help & FAQ", href: "/dashboard/help", icon: CircleHelp },
  ] },
]

const staffGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { label: "Workspace", items: [
    { title: "Complaints", href: "/dashboard/complaints", icon: MessageSquareText, badge: "Review" },
    { title: "Suggestions", href: "/dashboard/suggestions", icon: Lightbulb, badge: "Review" },
    { title: "Feedback", href: "/dashboard/feedback", icon: MessageSquareHeart },
  ] },
]

export function AppSidebar({
  role,
  userName,
  userEmail,
  userImage,
}: {
  role: UserRole
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}) {
  const pathname = usePathname()
  const customer = role === "CUSTOMER"
  const groups = customer ? customerGroups : staffGroups

  const itemClassName =
    "h-9 rounded-lg px-2.5 text-sidebar-foreground transition-[transform,colors,box-shadow] duration-200 ease-out hover:translate-x-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[0_8px_20px_-10px_var(--sidebar-primary)]"

  function renderBadge(badge: string, active: boolean) {
    return (
      <span className={cn(
        "rounded-full px-1.5 py-0.5 text-[8px] font-semibold transition-colors duration-200",
        active ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" : "bg-primary/15 text-primary"
      )}>
        {badge}
      </span>
    )
  }

  return (
    <Sidebar side="left" collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Height matches the dashboard header's h-16 so the two bottom borders line up. */}
      <SidebarHeader className="h-16 shrink-0 justify-center border-b border-sidebar-border px-4">
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
                      <SidebarMenuButton asChild isActive={active} className={itemClassName}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <Icon className="h-4 w-4 transition-transform duration-200 group-hover/menu-button:scale-110" />
                          <span className="flex-1 text-[13px]">{item.title}</span>
                          {item.badge && renderBadge(item.badge, active)}
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
        <NavUser userName={userName} userEmail={userEmail} userImage={userImage} />
      </SidebarFooter>
    </Sidebar>
  )
}
