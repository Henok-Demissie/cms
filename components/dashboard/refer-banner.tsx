import Link from "next/link"
import { ArrowRight, Gift } from "lucide-react"

export function ReferBanner() {
  return (
    <Link
      href="/dashboard/refer"
      className="card-shadow group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-brand-deep p-5 text-brand-deep-foreground transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-lime">
        <Gift className="size-4" aria-hidden /> Refer &amp; earn
      </div>
      <p className="text-lg font-bold leading-snug text-balance">
        Give a friend 1GB, get GHS 1.00 data credit for every first order.
      </p>
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
          Learn more <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-green/30 blur-2xl"
      />
    </Link>
  )
}
