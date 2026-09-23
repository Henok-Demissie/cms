import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/brand/logo"

const docs: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "Terms of Service",
    body: [
      "DataSpots sells prepaid mobile data, airtime and examination result checkers for Ghanaian networks. By funding a wallet or placing an order you agree to these terms.",
      "Orders are final once delivered to the recipient number you entered. Please verify numbers before paying. Orders rejected by a network are refunded to your wallet automatically.",
      "Wallet balances are non-withdrawable store credit and can only be spent on DataSpots services. Data credit earned through referrals is not transferable.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect the phone numbers, email address and payment references needed to fulfil your orders and secure your account. We never sell personal data.",
      "Order data is shared with the relevant mobile network only to the extent required to deliver your purchase.",
      "You can request deletion of your account and personal data at any time by contacting support@datasell.app.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    body: [
      "DataSpots is an independent reseller and is not affiliated with MTN Ghana, Telecel Ghana, AirtelTigo or WAEC.",
      "Delivery times depend on network conditions. Most orders are delivered within 30 minutes; during congestion delivery can take up to 48 hours.",
    ],
  },
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params
  const d = docs[doc]
  if (!d) notFound()
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
        <Logo />
        <Link href="/dashboard/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="title-bar text-2xl font-extrabold tracking-tight">{d.title}</h1>
        {d.body.map((p) => (
          <p key={p} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
        ))}
        <p className="text-xs text-muted-foreground">Last updated September 2026.</p>
      </main>
    </div>
  )
}
