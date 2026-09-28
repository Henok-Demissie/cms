import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { CalendarDays, Mail, User } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { formatGhs } from "@/lib/data"
import { getWalletBalance, getMyOrders } from "@/app/actions/orders"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  // Real authenticated session — no assumed Gmail or hardcoded user
  const session = await auth.api.getSession({ headers: await headers() })
  const sessionUser = session?.user

  const [balance, dbOrders] = await Promise.all([getWalletBalance(), getMyOrders()])
  const spent = dbOrders.reduce((s, o) => s + Number(o.customerPrice), 0)

  const name = sessionUser?.name?.trim() ?? ""
  const email = sessionUser?.email?.trim() ?? ""
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email
      ? email.slice(0, 1).toUpperCase()
      : ""

  const memberSince = sessionUser?.createdAt
    ? new Date(sessionUser.createdAt as unknown as string).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "—"

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <PageHeader title="Profile" subtitle="Your account details" />

      <section className="card-shadow flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="brand-gradient brand-glow flex size-16 items-center justify-center rounded-full text-2xl font-extrabold text-brand-deep">
          {initials || <User className="size-8 text-brand-deep" />}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{name || "My Account"}</h2>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden /> Member since {memberSince}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Orders</p>
            <p className="text-lg font-extrabold">{dbOrders.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Spent</p>
            <p className="text-lg font-extrabold text-brand-emerald">{formatGhs(spent)}</p>
          </div>
        </div>
      </section>

      <section className="card-shadow flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Personal information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Full name</label>
            <div className="h-11 flex items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-medium">
              {name || "—"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <div className="relative h-11 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              {email}
            </div>
            <p className="text-xs text-muted-foreground">Email is managed by your sign-in credentials.</p>
          </div>
        </div>
      </section>

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Wallet summary</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Balance</dt>
            <dd className="mt-1 text-lg font-extrabold">{formatGhs(balance)}</dd>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total spent</dt>
            <dd className="mt-1 text-lg font-extrabold text-brand-emerald">{formatGhs(spent)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
