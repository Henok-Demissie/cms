"use client"

import { Bell, LogOut, MoreVertical, Settings2, UserRound } from "lucide-react"
import { signOut } from "next-auth/react"

import { useAccountDrawer } from "@/components/dashboard/account-drawer"
import { useNotificationsDrawer } from "@/components/dashboard/notifications-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  userName,
  userEmail,
  userImage,
}: {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}) {
  const { isMobile } = useSidebar()
  const { enabled: notificationsEnabled, openDrawer } = useNotificationsDrawer()
  const { openAccount, openSettings } = useAccountDrawer()

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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {userImage ? <AvatarImage src={userImage} alt={name} /> : null}
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  {userImage ? <AvatarImage src={userImage} alt={name} /> : null}
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* Account, Settings and Notifications all open drawers. The menu
                  unmounts on select while vaul is mounting, so defer a frame to
                  keep Radix's focus restore from stealing focus back. */}
              <DropdownMenuItem onSelect={() => requestAnimationFrame(openAccount)}>
                <UserRound />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => requestAnimationFrame(openSettings)}>
                <Settings2 />
                Settings
              </DropdownMenuItem>
              {notificationsEnabled && (
                <DropdownMenuItem onSelect={() => requestAnimationFrame(openDrawer)}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => {
                void signOut({ callbackUrl: "/" })
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
