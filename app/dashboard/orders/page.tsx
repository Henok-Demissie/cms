import { PageHeader } from "@/components/brand/page-header"
import { OrdersList } from "@/components/orders/orders-list"
import { orders } from "@/lib/data"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Orders" subtitle={`${orders.length} orders placed · track every delivery in one place`} />
      <OrdersList />
    </div>
  )
}
