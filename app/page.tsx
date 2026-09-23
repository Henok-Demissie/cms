import Link from "next/link"
import { ArrowRight, Code2, Gift, ShieldCheck, Store, Zap } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { NetworkChip } from "@/components/brand/network-chip"
import { Button } from "@/components/ui/button"
import { WhatsAppFloat } from "@/components/shell/whatsapp-float"
import { bundles, formatGhs, networks } from "@/lib/data"

const features = [
  { icon: Zap, title: "Delivered in minutes", text: "Most bundles land in 5–30 minutes, tracked from payment to delivery." },
  { icon: ShieldCheck, title: "Auto refunds", text: "If a network rejects an order we refund your wallet instantly. No tickets." },
  { icon: Gift, title: "Refer & earn", text: "Give friends 1GB for GHS 3.50 and earn GHS 1.00 data credit each time." },
  { icon: Store, title: "Agent discounts", text: "Resell at up to 14% off across MTN, Telecel and AirtelTigo." },
  { icon: Code2, title: "Developer API", text: "One REST API for data, airtime and result checkers with webhooks." },
]

export default function HomePage() {
  const featured = bundles.filter((b) => !b.flexa).slice(0, 6)
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/developers">Developers</Link>
          </Button>
          <Button asChild size="sm" className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
            <Link href="/dashboard">
              Open app <ArrowRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="rise-in flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-green/40 bg-success/10 px-3 py-1 text-xs font-semibold text-brand-emerald">
              <span className="pulse-dot size-2 rounded-full bg-brand-green" aria-hidden /> System online · orders flowing
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Cheap data, <span className="brand-gradient-text">delivered fast.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              Buy MTN, Telecel and AirtelTigo bundles, airtime and WAEC result checkers from one wallet. Pay with MoMo, get it in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="brand-gradient brand-glow h-12 px-6 font-bold text-brand-deep hover:opacity-90">
                <Link href="/dashboard/buy">
                  Buy data now <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 font-semibold">
                <Link href="/developers">Developer API</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {networks.map((n) => (
                <NetworkChip key={n.id} id={n.id} />
              ))}
              <span className="text-xs text-muted-foreground">All major networks</span>
            </div>
          </div>

          <div className="relative">
            <div className="brand-gradient brand-glow absolute inset-0 -rotate-2 rounded-3xl opacity-90" aria-hidden />
            <div className="card-shadow relative rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Popular bundles</p>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-brand-emerald">LIVE PRICES</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {featured.map((b) => (
                  <Link
                    key={b.id}
                    href="/dashboard/buy"
                    className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-3 transition-colors hover:border-brand-green/60"
                  >
                    <NetworkChip id={b.network} />
                    <p className="text-xl font-extrabold">
                      {b.sizeGb}
                      <span className="text-xs font-semibold text-muted-foreground">GB</span>
                    </p>
                    <p className="brand-gradient-text text-sm font-extrabold">{formatGhs(b.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-shadow flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        <section className="brand-gradient brand-glow flex flex-col items-start justify-between gap-6 rounded-3xl p-8 text-brand-deep sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Ready when you are.</h2>
            <p className="mt-1 text-sm opacity-80">Fund your wallet once, buy for any number, any network.</p>
          </div>
          <Button asChild size="lg" className="h-12 bg-brand-deep px-6 font-bold text-brand-deep-foreground hover:bg-brand-deep/90">
            <Link href="/dashboard">Open DataSpots</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <Logo size="sm" showTagline={false} />
          <div className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/dashboard/support" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
      <WhatsAppFloat />
    </div>
  )
}
