import Link from "next/link"
import { ArrowRight, Gift, Share2, Smartphone, Users } from "lucide-react"
import { ReferCard } from "@/components/refer/refer-card"
import { StatusBadge } from "@/components/brand/status-badge"
import { EmptyState } from "@/components/brand/empty-state"
import { formatDate, formatGhs, referrals, wallet } from "@/lib/data"

const steps = [
  { icon: Share2, title: "Share your link", text: "Send it to friends on WhatsApp, your status, anywhere." },
  { icon: Smartphone, title: "They join & buy their first bundle", text: "New friends get MTN 1GB for GHS 3.50 on their very first purchase." },
  { icon: Gift, title: "You earn data credit", text: "Earn GHS 1.00 for each friend's first paid order — spend it on data.", highlight: true },
]

export default function ReferPage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <ReferCard />

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="title-bar text-sm font-bold">Data credit</h2>
          <Link href="/dashboard/buy" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:underline">
            Use it <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl bg-muted py-3">
          {[
            ["Earned", wallet.dataCredit.earned],
            ["Used", wallet.dataCredit.used],
            ["Left", wallet.dataCredit.left],
          ].map(([label, v]) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-base font-extrabold text-brand-emerald">{formatGhs(Number(v))}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Your referrals</h2>
        {referrals.length === 0 ? (
          <EmptyState icon={Users} title="No referrals yet" description="Share your link above — they'll show up here once they join." className="mt-4 border-0 shadow-none" />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {referrals.map((r) => (
              <li key={r.name} className="flex items-center gap-3 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{r.name[0]}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Joined {formatDate(r.joined)}</p>
                </div>
                <StatusBadge status={r.status as "qualified" | "joined"} />
              </li>
            ))}
          </ul>
        )}
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
          Used at checkout — not withdrawable.
          <Link href="/dashboard/buy" className="font-semibold text-brand-emerald hover:underline">
            Spend it →
          </Link>
        </p>
      </section>
    </div>
  )
}
