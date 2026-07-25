"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquareText, Settings, ShieldCheck } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Complaints", href: "/dashboard/complaints", icon: MessageSquareText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar({ variant = "sidebar" }: { variant?: "sidebar" | "floating" | "inset" }) {
  const pathname = usePathname()

  return (
    <Sidebar side="left" variant={variant} className="border-r border-border">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">ResolveHQ</p>
            <p className="text-xs text-muted-foreground">Complaint management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Your workspace</p>
          <p className="mt-1">Manage complaints, SLA replies, and team activity from one place.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
