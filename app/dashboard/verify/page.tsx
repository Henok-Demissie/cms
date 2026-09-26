import Link from "next/link"
import { headers } from "next/headers"
import { CheckCircle2, XCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { verifyTransaction } from "@/lib/paystack"
import { creditWalletForTopup, markTopupFailed } from "@/lib/topups"
import { PageHeader } from "@/components/brand/page-header"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { formatGhs } from "@/lib/data"

export const dynamic = "force-dynamic"

/**
 * Landing page after Paystack redirects the customer back from checkout.
 * The webhook is the source of truth for crediting the wallet, but webhooks
 * can be delayed — this page independently verifies the transaction with
 * Paystack and credits it here if the webhook hasn't landed yet.
 * creditWalletForTopup is idempotent, so whichever path runs first wins.
 */
export default async function WalletVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const reference = params.reference || params.trxref

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  const outcome = await resolveOutcome(reference, userId)

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title="Top up" subtitle="Payment status" />
      <Empty className="card-shadow rounded-2xl border border-border bg-card">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className={outcome.ok ? "brand-gradient border-0 text-brand-deep" : "border-0 bg-destructive/10 text-destructive"}
          >
            {outcome.ok ? <CheckCircle2 /> : <XCircle />}
          </EmptyMedia>
          <EmptyTitle>{outcome.title}</EmptyTitle>
          <EmptyDescription>{outcome.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard/wallet">Back to wallet</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

async function resolveOutcome(reference: string | undefined, userId: string | undefined) {
  if (!userId) {
    return { ok: false, title: "Sign in required", description: "Please sign in to view this payment." }
  }
  if (!reference) {
    return { ok: false, title: "Missing reference", description: "We couldn't find a payment reference to check." }
  }

  const { rows } = await pool.query(
    `SELECT "userId", amount, status FROM topups WHERE reference = $1 LIMIT 1`,
    [reference],
  )
  const topup = rows[0]
  if (!topup || topup.userId !== userId) {
    return { ok: false, title: "Payment not found", description: "We couldn't find this payment on your account." }
  }

  if (topup.status === "success") {
    return {
      ok: true,
      title: "Payment successful",
      description: `${formatGhs(Number(topup.amount))} has been added to your wallet.`,
    }
  }
  if (topup.status === "failed") {
    return { ok: false, title: "Payment failed", description: "This payment didn't go through. No funds were added." }
  }

  try {
    const result = await verifyTransaction(reference)
    if (result.status === "success") {
      await creditWalletForTopup(reference, null)
      return {
        ok: true,
        title: "Payment successful",
        description: `${formatGhs(Number(topup.amount))} has been added to your wallet.`,
      }
    }
    await markTopupFailed(reference)
    return { ok: false, title: "Payment failed", description: "This payment didn't go through. No funds were added." }
  } catch (err) {
    console.log("[v0] paystack verify failed:", (err as Error).message)
    return {
      ok: false,
      title: "Still checking",
      description: "We couldn't confirm this payment yet. If money left your account, your wallet will update shortly.",
    }
  }
}
