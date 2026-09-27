import Link from "next/link"
import { ArrowRight, Gift, Share2, Smartphone } from "lucide-react"
import { ReferCard } from "@/components/refer/refer-card"
import { EmptyState } from "@/components/brand/empty-state"
import { PageHeader } from "@/components/brand/page-header"
import { getReferralProfile } from "@/app/actions/referral"
import { Users } from "lucide-react"

const steps = [
  {
    icon: Share2,
    title: "Share your link",
    text: "Send it to friends on WhatsApp, your status, or anywhere.",
  },
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

export const dynamic = "force-dynamic"

export default async function ReferPage() {
  // Fetch (or lazily create) this user's unique referral code from the DB
  const profile = await getReferralProfile()

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <PageHeader title="Refer & Earn" subtitle="Invite friends and earn data credit" />

      {profile ? (
        <ReferCard
          code={profile.code}
          link={profile.link}
          referralCount={profile.referralCount}
          qualifiedCount={profile.qualifiedCount}
        />
      ) : (
        <EmptyState
          icon={Gift}
          title="Could not load your referral link"
          description="Please refresh the page. If the problem persists, contact support."
        />
      )}

      {/* Referral list — empty until referral tracking is wired to DB */}
      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Your referrals</h2>
        <EmptyState
          icon={Users}
          title="No referrals yet"
          description="Share your unique link above — friends will appear here after they join."
          className="mt-4 border-0 shadow-none"
        />
      </section>

      {/* How it works */}
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
    </div>
  )
}
