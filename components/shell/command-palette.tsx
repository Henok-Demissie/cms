"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  Code2,
  Gift,
  Headset,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  User,
  Wallet,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { bundles, formatGhs, networks } from "@/lib/data"

const pages = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "D" },
  { href: "/dashboard/buy", label: "Buy Data", icon: ShoppingCart, key: "B" },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList, key: "O" },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, key: "W" },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/track", label: "Track Order", icon: Search },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/support", label: "Support", icon: Headset },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/developers", label: "Developer API", icon: Code2 },
]

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const popular = bundles.filter((b) => b.popular).slice(0, 4)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Jump to a page or bundle">
      <CommandInput placeholder="Search pages, bundles, orders..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              <p.icon />
              <span>{p.label}</span>
              {p.key && <CommandShortcut>⌘{p.key}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Popular bundles">
          {popular.map((b) => (
            <CommandItem key={b.id} onSelect={() => go("/dashboard/buy")}>
              <ShoppingCart />
              <span>
                {networks.find((n) => n.id === b.network)?.name} {b.sizeGb}GB
                {b.flexa ? " Flexa" : ""}
              </span>
              <CommandShortcut>{formatGhs(b.price)}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
