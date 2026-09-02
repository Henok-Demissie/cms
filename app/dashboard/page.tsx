import { DashboardHero } from "@/components/dashboard/hero"
import { SystemStatus } from "@/components/dashboard/system-status"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { SpendChart } from "@/components/dashboard/spend-chart"
import { ReferBanner } from "@/components/dashboard/refer-banner"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <DashboardHero />
      <SystemStatus />
      <QuickActions />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <WalletCard />
          <RecentOrders />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-2">
          <SpendChart />
          <ReferBanner />
        </div>
      </div>
    </div>
  )
}
