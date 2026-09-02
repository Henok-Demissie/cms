import { PageHeader } from "@/components/brand/page-header"
import { BuyData } from "@/components/buy/buy-data"

export default function BuyPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Buy Data" subtitle="Choose a network, then a bundle" />
      <BuyData />
    </div>
  )
}
