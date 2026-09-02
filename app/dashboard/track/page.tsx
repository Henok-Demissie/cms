import { PageHeader } from "@/components/brand/page-header"
import { TrackOrder } from "@/components/track/track-order"

export default function TrackPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <PageHeader title="Track Order" subtitle="Enter an Order ID or phone number" />
      <TrackOrder />
    </div>
  )
}
