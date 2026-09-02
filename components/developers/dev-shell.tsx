"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ClipboardList,
  KeyRound,
  LayoutGrid,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  Tag,
  Terminal,
  Wallet,
  Webhook,
  Workflow,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { WhatsAppFloat } from "@/components/shell/whatsapp-float"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const groups = [
  { label: "Overview", items: [{ href: "/developers", label: "Overview", icon: LayoutGrid }] },
  {
    label: "Build",
    items: [
      { href: "/developers/keys", label: "API keys", icon: KeyRound },
      { href: "/developers/access", label: "API access", icon: Workflow },
      { href: "/developers/pricing", label: "Pricing", icon: Tag },
      { href: "/developers/orders", label: "Orders", icon: ClipboardList },
      { href: "/developers/logs", label: "Request logs", icon: Terminal },
      { href: "/developers/webhooks", label: "Webhooks", icon: Webhook },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
      { href: "/developers/usage", label: "Usage", icon: BarChart3 },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/developers/docs", label: "Documentation", icon: BookOpen },
      { href: "/developers/security", label: "Security", icon: Shield },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-5 p-4">
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{g.label}</p>
          {g.items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-brand-emerald" : "text-muted-foreground"}`} aria-hidden />
                {label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function DevShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Developer navigation</SheetTitle>
              <div className="border-b border-border p-4">
                <Logo showTagline={false} />
              </div>
              <Nav />
            </SheetContent>
          </Sheet>
          <Logo showTagline={false} />
          <span className="brand-gradient rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-deep">
            Developers
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Back to app
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-sidebar lg:block">
          <Nav />
        </aside>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
      <WhatsAppFloat />
    </div>
  )
}
