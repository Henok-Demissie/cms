"use client"

import { LogOut, MoreVertical, Settings2, UserRound } from "lucide-react"
import { signOut } from "next-auth/react"

import { useAccountPanel } from "@/components/dashboard/account-panel"
import { AppearanceSetting } from "@/components/dashboard/appearance-setting"
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
  const { openAccount, openSettings } = useAccountPanel()

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

            {/* No Notifications row: the header bell is the one way in, and it
                carries the unread count. Both of these open an overlay, so defer a
                frame — the menu unmounts on select while the overlay is mounting,
                and Radix's focus restore would otherwise steal focus back. */}
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => requestAnimationFrame(openAccount)}>
                <UserRound />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => requestAnimationFrame(openSettings)}>
                <Settings2 />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Day/night stays in the menu rather than going into Settings: it is
                one tap and the result is the whole screen, so a panel in between
                only gets in the way. Not a DropdownMenuItem — selecting one closes
                the menu before the flip can be seen — so the menu's own arrow-key
                and typeahead handling has to be kept off the switch. */}
            <div className="px-2 py-1.5" onKeyDown={(event) => event.stopPropagation()}>
              <AppearanceSetting />
            </div>

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
