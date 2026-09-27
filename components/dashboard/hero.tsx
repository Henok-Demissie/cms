import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { ArrowUpRight, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export async function DashboardHero() {
  // Get the real signed-in user — no hardcoded name
  const session = await auth.api.getSession({ headers: await headers() })
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <section className="brand-gradient brand-glow rise-in relative overflow-hidden rounded-2xl px-6 py-6 text-brand-deep sm:px-8 sm:py-7">
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit border-0 bg-brand-deep/12 text-brand-deep hover:bg-brand-deep/12">
            <span className="pulse-dot size-1.5 rounded-full bg-brand-deep" aria-hidden />
            All systems operational
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {greeting()}, {firstName}
          </h1>
          <p className="max-w-md text-sm font-medium opacity-80 text-pretty">
            Bundles are delivering in 5–30 minutes across MTN, Telecel and AirtelTigo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-brand-deep text-brand-deep-foreground hover:bg-brand-deep/90">
            <Link href="/dashboard/buy">
              <ShoppingCart data-icon="inline-start" />
              Buy data
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand-deep hover:bg-brand-deep/10 hover:text-brand-deep">
            <Link href="/dashboard/wallet">
              Top up
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/25 blur-3xl" />
    </section>
  )
}
