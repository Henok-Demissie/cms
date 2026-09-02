import { Activity, ClipboardList, Gift, Wallet } from "lucide-react"
import { DashboardHero } from "@/components/dashboard/hero"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { SpendChart } from "@/components/dashboard/spend-chart"
import { ReferBanner } from "@/components/dashboard/refer-banner"
import { StatCard } from "@/components/brand/stat-card"
import { formatGhs, orders, wallet } from "@/lib/data"

export default function DashboardPage() {
  const delivered = orders.filter((o) => o.status === "delivered").length
  const rate = Math.round((delivered / orders.length) * 100)
  const spend = orders.reduce((s, o) => s + o.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />

      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet balance"
          value={formatGhs(wallet.balance)}
          icon={Wallet}
          delta={{ value: "+GHS 50.00" }}
          hint="last top-up"
        />
        <StatCard label="Orders · 30d" value={String(orders.length)} icon={ClipboardList} delta={{ value: "+12%" }} hint="vs last month" />
        <StatCard label="Spend · 30d" value={formatGhs(spend)} icon={Activity} delta={{ value: "+8%" }} hint="vs last month" />
        <StatCard label="Success rate" value={`${rate}%`} icon={Gift} hint={`${orders.length - delivered} pending or failed`} />
      </section>

      <QuickActions />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <RecentOrders />
          <SpendChart />
        </div>
        <div className="flex flex-col gap-6">
          <WalletCard />
          <ReferBanner />
        </div>
      </div>
    </div>
  )
}
