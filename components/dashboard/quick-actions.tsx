import Link from "next/link"
import { ClipboardList, Gift, Headset, Search } from "lucide-react"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

const actions = [
  { href: "/dashboard/orders", label: "Orders", desc: "Track deliveries", icon: ClipboardList },
  { href: "/dashboard/refer", label: "Free data", desc: "Invite & earn", icon: Gift, highlight: true },
  { href: "/dashboard/support", label: "Support", desc: "We reply fast", icon: Headset },
  { href: "/dashboard/track", label: "Track", desc: "Find any order", icon: Search },
]

export function QuickActions() {
  return (
    <ItemGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Quick actions">
      {actions.map((a) => (
        <Item key={a.href} asChild variant="outline" className="card-shadow bg-card transition-colors hover:border-primary/40">
          <Link href={a.href}>
            <ItemMedia variant="icon" className={a.highlight ? "brand-gradient border-0 text-brand-deep" : "text-brand-emerald"}>
              <a.icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{a.label}</ItemTitle>
              <ItemDescription>{a.desc}</ItemDescription>
            </ItemContent>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  )
}
