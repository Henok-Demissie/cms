import { User } from "lucide-react"
import { user } from "@/lib/data"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export function DashboardHero() {
  return (
    <section className="brand-gradient brand-glow rise-in relative overflow-hidden rounded-2xl p-5 text-brand-deep sm:p-6">
      <div className="relative flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-deep/12 ring-1 ring-brand-deep/15">
          <User className="size-5" aria-hidden />
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {greeting()}, {user.name}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Fast data delivery platform</p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/25 blur-2xl"
      />
    </section>
  )
}
