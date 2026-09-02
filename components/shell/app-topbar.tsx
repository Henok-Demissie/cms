"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Megaphone, Menu, Moon, Sun, LogOut, User, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { Logo } from "@/components/brand/logo"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { user } from "@/lib/data"

function IconButton({
  label,
  children,
  onClick,
  badge,
}: {
  label: string
  children: React.ReactNode
  onClick?: () => void
  badge?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      {children}
      {badge && (
        <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
      )}
    </button>
  )
}

export function AppTopbar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Logo size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </IconButton>
        <IconButton label="Announcements">
          <Megaphone className="size-4" />
        </IconButton>
        <IconButton label="Notifications" badge>
          <Bell className="size-4" />
        </IconButton>
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="brand-gradient brand-glow grid size-10 place-items-center rounded-full text-sm font-extrabold text-primary-foreground"
            >
              {user.initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-bold">{user.fullName}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut className="size-4" /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
