import Link from "next/link"
import { ArrowRight, Gift, Share2, Smartphone, Users } from "lucide-react"
import { EmptyState } from "@/components/brand/empty-state"
import { PageHeader } from "@/components/brand/page-header"

const steps = [
  { icon: Share2, title: "Share your link", text: "Send it to friends on WhatsApp, your status, anywhere." },
  {
    icon: Smartphone,
    title: "They join & buy their first bundle",
    text: "New friends get MTN 1GB for GHS 3.50 on their very first purchase.",
  },
  {
    icon: Gift,
    title: "You earn data credit",
    text: "Earn GHS 1.00 for each friend's first paid order — spend it on data.",
    highlight: true,
  },
]

export default function ReferPage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <PageHeader title="Refer & Earn" subtitle="Invite friends and earn data credit" />

      {/* Referral stats — shown as empty state until the feature is fully wired to DB */}
      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Your referrals</h2>
        <EmptyState
          icon={Users}
          title="No referrals yet"
          description="Share your referral link — friends will show up here once they join."
          className="mt-4 border-0 shadow-none"
        />
      </section>

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">How it works</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {steps.map(({ icon: Icon, title, text, highlight }) => (
            <li key={title} className="flex gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  highlight ? "brand-gradient text-brand-deep" : "bg-muted text-brand-emerald"
                }`}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          Data credit is used at checkout — not withdrawable.
          <Link href="/dashboard/buy" className="font-semibold text-brand-emerald hover:underline">
            Spend it →
          </Link>
        </p>
      </section>

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="title-bar text-sm font-bold">Buy data</h2>
          <Link
            href="/dashboard/buy"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:underline"
          >
            Shop bundles <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Top up your wallet and use it to buy data bundles for any Ghana number instantly.
        </p>
      </section>
    </div>
  )
}
