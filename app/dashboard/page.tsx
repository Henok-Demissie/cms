import { Activity, ClipboardList, Gift, Wallet } from "lucide-react"
import { DashboardHero } from "@/components/dashboard/hero"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StatCard } from "@/components/brand/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/brand/empty-state"
import { getMyOrders, getWalletBalance } from "@/app/actions/orders"
import { formatGhs } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [balance, userOrders] = await Promise.all([getWalletBalance(), getMyOrders()])
  const delivered = userOrders.filter((order) => order.status === "delivered").length
  const spend = userOrders.reduce((total, order) => total + Number(order.customerPrice), 0)
  const rate = userOrders.length ? Math.round((delivered / userOrders.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />
      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wallet balance" value={formatGhs(balance)} icon={Wallet} hint="real available balance" />
        <StatCard label="Orders" value={String(userOrders.length)} icon={ClipboardList} hint="your account" />
        <StatCard label="Spend" value={formatGhs(spend)} icon={Activity} hint="your orders" />
        <StatCard label="Success rate" value={userOrders.length ? `${rate}%` : "—"} icon={Gift} hint="based on your orders" />
      </section>
      <QuickActions />
      <Card className="card-shadow">
        <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
        <CardContent>
          {userOrders.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No orders yet" description="Your real orders will appear here after your first purchase." />
          ) : (
            <div className="divide-y divide-border">{userOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                <span>{order.network.toUpperCase()} · {order.volume} · {order.recipient}</span>
                <span className="font-semibold">{formatGhs(Number(order.customerPrice))}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
