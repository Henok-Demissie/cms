"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShieldCheck, Users, ClipboardList, ArrowLeft, LogOut, LayoutDashboard, Crown } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function AdminNav({ isOwner, userEmail }: { isOwner?: boolean; userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-6">
        <Logo href="/admin" size="sm" />

        {isOwner ? (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Crown className="size-3.5 text-amber-500" />
            <span>Owner Console</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <ShieldCheck className="size-3.5 text-blue-500" />
            <span>Admin Console</span>
          </div>
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href
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

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex gap-1.5 text-xs font-semibold">
          <Link href="/dashboard">
            <ArrowLeft className="size-3.5" />
            <span>Customer App</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          <span>Sign out</span>
        </Button>
      </div>
    </header>
  )
}
