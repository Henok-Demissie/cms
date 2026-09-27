import { Activity, ClipboardList, Gift, Wallet } from "lucide-react"
import { DashboardHero } from "@/components/dashboard/hero"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { ReferBanner } from "@/components/dashboard/refer-banner"
import { StatCard } from "@/components/brand/stat-card"
import { formatGhs } from "@/lib/data"
import { getWalletBalance, getMyOrders } from "@/app/actions/orders"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Fetch real data per logged-in user — no demo numbers
  const [balance, dbOrders] = await Promise.all([getWalletBalance(), getMyOrders()])

  const delivered = dbOrders.filter((o) => o.status === "delivered").length
  const rate = dbOrders.length > 0 ? Math.round((delivered / dbOrders.length) * 100) : 0
  const spend = dbOrders.reduce((s, o) => s + Number(o.customerPrice), 0)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />

      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet balance"
          value={formatGhs(balance)}
          icon={Wallet}
          hint="current balance"
        />
        <StatCard
          label="Orders placed"
          value={String(dbOrders.length)}
          icon={ClipboardList}
          hint="all time"
        />
        <StatCard
          label="Total spent"
          value={formatGhs(spend)}
          icon={Activity}
          hint="all time"
        />
        <StatCard
          label="Success rate"
          value={dbOrders.length > 0 ? `${rate}%` : "—"}
          icon={Gift}
          hint={dbOrders.length > 0 ? `${dbOrders.length - delivered} pending or failed` : "No orders yet"}
        />
      </section>

      <QuickActions />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <RecentOrders orders={dbOrders} />
        </div>
        <div className="flex flex-col gap-6">
          <WalletCard balance={balance} />
          <ReferBanner />
        </div>
      </div>
    </div>
  )
}
