import Link from "next/link"
import { getAdminOverview } from "@/lib/owner"
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Crown,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function formatGHS(amount: number) {
  return `GHS ${Number(amount || 0).toFixed(2)}`
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function AdminOverviewPage() {
  const data = await getAdminOverview()

  const profitMargin =
    data.totalRevenue > 0
      ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 px-2.5 text-xs font-bold gap-1.5 border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-3.5" />
                <span>← Back to Customer Dashboard</span>
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Platform Metrics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Owner Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, Owner (<span className="font-mono text-foreground font-semibold">Pboxtv9@gmail.com</span>). Complete oversight of users, revenue, and data order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">
              <Users className="size-4 mr-2" />
              Manage Users ({data.totalUsers})
            </Link>
          </Button>
          <Button asChild size="sm" className="brand-gradient brand-glow font-bold text-brand-deep">
            <Link href="/admin/orders">
              <ShoppingCart className="size-4 mr-2" />
              All Orders ({data.totalOrders})
            </Link>
          </Button>
        </div>
      </div>

      {/* Provider Wholesale Balance Alert */}
      {(data.providerBalance === null || data.providerBalance < 15) && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-foreground flex items-start gap-4">
          <AlertTriangle className="size-6 shrink-0 text-amber-500 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base text-foreground">
                Action Required: Wholesale Gateway Balance is Low ({data.providerBalance !== null ? formatGHS(data.providerBalance) : "Low"})
              </h3>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                iDataGH Gateway
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-3xl">
              When customers order data bundles, Ghdatastore automatically dispenses them via your <strong>iDataGH (idatagh.com)</strong> wholesale account. Because your wholesale balance is depleted, telecom fulfillment failed and customers were refunded. Top up your wholesale account on idatagh.com to enable instant delivery.
            </p>
            <div className="mt-3">
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8">
                <a href="https://idatagh.com" target="_blank" rel="noopener noreferrer">
                  Top Up iDataGH Wholesale Balance →
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Revenue */}
        <div className="card-shadow rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <span className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
              <DollarSign className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {formatGHS(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed orders
            </p>
          </div>
        </div>

        {/* Metric 2: Net Profit */}
        <div className="card-shadow rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Profit</span>
            <span className="rounded-full bg-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatGHS(data.totalProfit)}
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              {profitMargin}% profit margin
            </p>
          </div>
        </div>

        {/* Metric 3: Total Orders */}
        <div className="card-shadow rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            <span className="rounded-full bg-blue-500/10 p-2 text-blue-500">
              <ShoppingCart className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {data.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-semibold">{data.completedOrders} ok</span> ·{" "}
              <span className="text-amber-500 font-semibold">{data.pendingOrders} pend</span> ·{" "}
              <span className="text-red-500 font-semibold">{data.failedOrders} err</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Registered Users */}
        <div className="card-shadow rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <span className="rounded-full bg-purple-500/10 p-2 text-purple-500">
              <Users className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {data.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalUsers} total · <span className="text-amber-500 font-semibold">{data.totalAdmins} admin{data.totalAdmins === 1 ? "" : "s"}</span>
            </p>
          </div>
        </div>

        {/* Metric 5: Float in customer wallets */}
        <div className="card-shadow rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer Float</span>
            <span className="rounded-full bg-amber-500/10 p-2 text-amber-500">
              <Wallet className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {formatGHS(data.totalWalletFloat)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total customer wallet balances
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Global Recent Orders */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Recent Orders (All Users)</h2>
              <p className="text-xs text-muted-foreground">Live order fulfillment stream across MTN, Telecel, AirtelTigo</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders" className="text-xs font-semibold">
                View all orders <ArrowUpRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
            {data.recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-semibold">No orders yet</p>
                <p className="text-xs text-muted-foreground">Orders placed by customers will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Package</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Price / Cost</th>
                      <th className="px-4 py-3">Profit</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.recentOrders.map((order: any) => {
                      const profit = Number(order.customerPrice || 0) - Number(order.costPrice || 0)
                      return (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{order.user_name || "Unknown"}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{order.user_email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-foreground">{order.network}</span>{" "}
                            <span>{order.volume}</span>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {order.recipient}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{formatGHS(order.customerPrice)}</div>
                            <div className="text-[10px] text-muted-foreground">Cost: {formatGHS(order.costPrice)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              +{formatGHS(profit)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.status === "completed" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                <CheckCircle2 className="size-3" /> Done
                              </span>
                            ) : order.status === "pending" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                                <Clock className="size-3" /> Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                                <XCircle className="size-3" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Latest Registered Customers */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">New Customers</h2>
              <p className="text-xs text-muted-foreground">Recent signups on Ghdatastore</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users" className="text-xs font-semibold">
                All Users <ArrowUpRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
            {data.recentUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              data.recentUsers.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{u.name || "Customer"}</p>
                      {u.role === "owner" && (
                        <Crown className="size-3 text-amber-500 shrink-0" />
                      )}
                      {u.role === "admin" && (
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground font-mono">{u.email}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Joined {formatDate(u.createdAt)}</span>
                      {u.referralCode && (
                        <span className="rounded bg-muted px-1 font-mono font-semibold">
                          Ref: {u.referralCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-500">{formatGHS(u.balance)}</p>
                    <p className="text-[10px] text-muted-foreground">{u.order_count || 0} orders</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
