import { PageHeader } from "@/components/brand/page-header"
import { OrdersList } from "@/components/orders/orders-list"
import { orders } from "@/lib/data"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="My Orders" subtitle={`${orders.length} orders`} />
      <OrdersList />
    </div>
  )
}
