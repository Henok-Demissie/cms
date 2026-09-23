import { PageHeader } from "@/components/brand/page-header"
import { LiveBuyData, type PackagesByNetwork } from "@/components/buy/live-buy-data"
import { getRetailPackages } from "@/lib/pricing"
import { getWalletBalance } from "@/app/actions/orders"

export const dynamic = "force-dynamic"

export default async function BuyPage() {
  const [walletBalance, mtn, telecel, airteltigo] = await Promise.all([
    getWalletBalance(),
    getRetailPackages("mtn").catch(() => []),
    getRetailPackages("telecel").catch(() => []),
    getRetailPackages("airteltigo").catch(() => []),
  ])

  // Strip cost prices before sending to the client.
  const strip = (list: Awaited<ReturnType<typeof getRetailPackages>>) =>
    list.map((p) => ({
      packageId: p.packageId,
      label: p.label,
      dataSize: p.dataSize,
      customerPrice: p.customerPrice,
    }))

  const packages: PackagesByNetwork = {
    mtn: strip(mtn),
    telecel: strip(telecel),
    airteltigo: strip(airteltigo),
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Buy Data" subtitle="Choose a network, then a bundle — delivered live" />
      <LiveBuyData packages={packages} walletBalance={walletBalance} />
    </div>
  )
}
