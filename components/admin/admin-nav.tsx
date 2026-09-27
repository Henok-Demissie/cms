"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ShieldCheck,
  Users,
  ClipboardList,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Crown,
  Menu,
  ChevronRight,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

export function AdminNav({ isOwner, userEmail }: { isOwner?: boolean; userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "All Customers", icon: Users },
    { href: "/admin/orders", label: "All Orders", icon: ClipboardList },
    { href: "/admin/owners", label: "Owner's Place", icon: Crown },
  ]

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-md sm:px-8">
        {/* Left: Brand + Role Badge + Desktop Links */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="md:hidden -ml-1 h-8 px-2 text-xs font-bold gap-1 text-foreground hover:bg-muted"
          >
            <Link href="/dashboard" aria-label="Back to customer dashboard">
              <ArrowLeft className="size-4 text-brand-emerald" />
              <span>Back</span>
            </Link>
          </Button>

          <Logo href="/admin" size="sm" showTagline={false} />

          {isOwner ? (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 sm:px-2.5 sm:text-xs">
              <Crown className="size-3 text-amber-500" />
              <span className="hidden xs:inline">Owner Console</span>
              <span className="xs:hidden">Owner</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 sm:px-2.5 sm:text-xs">
              <ShieldCheck className="size-3 text-blue-500" />
              <span className="hidden xs:inline">Admin Console</span>
              <span className="xs:hidden">Admin</span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Always Visible Back to Dashboard Button (Mobile + Desktop) */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-bold border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back to Customer App</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </Button>

          {/* Desktop Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hidden sm:inline-flex gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive h-8"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </Button>

          {/* Mobile Hamburger Drawer Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 md:hidden text-foreground hover:bg-muted"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs p-5 flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                <SheetHeader className="text-left pb-2 border-b border-border">
                  <SheetTitle className="flex items-center justify-between">
                    <Logo href="/admin" size="sm" showTagline={false} />
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {isOwner ? "Owner" : "Admin"}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Prominent Back to Customer App banner in Mobile Drawer */}
                <SheetClose asChild>
                  <Link
                    href="/dashboard"
                    className="brand-gradient brand-glow flex items-center justify-between rounded-xl p-3.5 text-brand-deep font-bold shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowLeft className="size-4" />
                      <span className="text-sm">Customer Dashboard</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-brand-deep/15 px-2 py-0.5 rounded-full">
                      Exit Admin →
                    </span>
                  </Link>
                </SheetClose>

                {/* Console Navigation Links */}
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                    Console Navigation
                  </p>
                  {navLinks.map((link) => {
                    const active = isActive(link.href)
                    const Icon = link.icon
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="size-4" />
                            <span>{link.label}</span>
                          </div>
                          <ChevronRight className="size-3.5 opacity-50" />
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
              </div>

              {/* Bottom user card & sign out */}
              <div className="border-t border-border pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-foreground truncate">
                      {userEmail || "Signed in as Owner"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Full Platform Authority</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full gap-2 font-bold text-xs h-9"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav
        aria-label="Mobile console navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around border-t border-border bg-background/95 backdrop-blur-lg px-1 py-1.5 shadow-lg"
      >
        {navLinks.map((link) => {
          const active = isActive(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                active
                  ? "text-brand-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-brand-emerald stroke-[2.5]" : ""}`} />
              <span className="truncate max-w-[65px]">{link.label.replace("All ", "")}</span>
            </Link>
          )
        })}

        {/* 5th Mobile Bottom Link: Direct 1-tap Return to Customer Dashboard */}
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-bold text-brand-emerald"
        >
          <div className="rounded-full bg-brand-emerald/15 p-0.5">
            <ArrowLeft className="size-3.5 text-brand-emerald stroke-[2.5]" />
          </div>
          <span>Exit Admin</span>
        </Link>
      </nav>
    </>
  )
}
