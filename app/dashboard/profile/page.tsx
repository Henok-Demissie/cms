import { CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { formatGhs, orders, user, wallet } from "@/lib/data"

export default function ProfilePage() {
  const spent = orders.reduce((s, o) => s + o.amount, 0)
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <PageHeader title="Profile" subtitle="Your account details" />

      <section className="card-shadow flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="brand-gradient brand-glow flex size-16 items-center justify-center rounded-full text-2xl font-extrabold text-brand-deep">
          {user.initials}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{user.fullName}</h2>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden /> Member since {user.memberSince}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Orders</p>
            <p className="text-lg font-extrabold">{orders.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Spent</p>
            <p className="text-lg font-extrabold text-brand-emerald">{formatGhs(spent)}</p>
          </div>
        </div>
      </section>

      <ProfileForm name={user.fullName} phone={user.phone} email={user.email} />

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Wallet summary</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Balance", wallet.balance],
            ["Deposited", wallet.totalDeposited],
            ["Data credit", wallet.dataCredit.left],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted p-4">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-lg font-extrabold">{formatGhs(Number(v))}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
