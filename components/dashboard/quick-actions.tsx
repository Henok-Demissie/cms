import Link from "next/link"
import { ClipboardList, Gift, MessageCircle, Search } from "lucide-react"

const actions = [
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/refer", label: "Free data", icon: Gift, highlight: true },
  { href: "/dashboard/support", label: "Support", icon: MessageCircle },
  { href: "/dashboard/track", label: "Track", icon: Search },
]

export function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ href, label, icon: Icon, highlight }) => (
        <Link
          key={href}
          href={href}
          className={`card-shadow group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-brand-green/50 ${
            highlight ? "brand-gradient-soft border-brand-green/40" : "border-border bg-card"
          }`}
        >
          {highlight && (
            <span className="absolute right-3 top-3 size-2 rounded-full bg-brand-green" aria-hidden />
          )}
          <span
            className={`flex size-11 items-center justify-center rounded-full ${
              highlight ? "brand-gradient text-brand-deep" : "bg-muted text-brand-emerald"
            }`}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
