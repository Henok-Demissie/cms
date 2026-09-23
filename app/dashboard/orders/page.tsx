import { PageHeader } from "@/components/brand/page-header"
import { LiveOrders, type LiveOrder } from "@/components/orders/live-orders"
import { getMyOrders } from "@/app/actions/orders"
import type { NetworkId } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const rows = await getMyOrders()
  const orders: LiveOrder[] = rows.map((o) => ({
    id: o.id,
    network: o.network as NetworkId,
    volume: o.volume,
    recipient: o.recipient,
    reference: o.reference,
    amount: Number(o.customerPrice),
    status: o.status as LiveOrder["status"],
    createdAt: (o.createdAt as unknown as Date).toISOString(),
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} placed · track every delivery in one place`}
      />
      <LiveOrders orders={orders} />
    </div>
  )
}
