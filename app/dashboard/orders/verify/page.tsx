import Link from "next/link"
import { headers } from "next/headers"
import { CheckCircle2, XCircle, ArrowRight, ShoppingCart } from "lucide-react"
import { auth } from "@/lib/auth"
import { verifyTransaction } from "@/lib/paystack"
import { fulfillDirectBundleOrder } from "@/lib/topups"
import { PageHeader } from "@/components/brand/page-header"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function OrderVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const reference = params.reference || params.trxref

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  const outcome = await resolveOrderOutcome(reference, userId)

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title="Order Payment" subtitle="Direct checkout verification" />
      <Empty className="card-shadow rounded-2xl border border-border bg-card p-6 sm:p-8">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className={outcome.ok ? "brand-gradient border-0 text-brand-deep size-16" : "border-0 bg-destructive/10 text-destructive size-16"}
          >
            {outcome.ok ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
          </EmptyMedia>
          <EmptyTitle className="text-2xl font-bold">{outcome.title}</EmptyTitle>
          <EmptyDescription className="text-sm max-w-md mx-auto">{outcome.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-3 mt-4">
          <Button asChild className="brand-gradient brand-glow font-bold text-brand-deep">
            <Link href="/dashboard/orders">
              View My Orders <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/buy">
              <ShoppingCart className="size-4 mr-1.5" /> Buy Another
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

async function resolveOrderOutcome(reference: string | undefined, userId: string | undefined) {
  if (!userId) {
    return { ok: false, title: "Sign in required", description: "Please sign in to view your order." }
  }
  if (!reference) {
    return { ok: false, title: "Missing reference", description: "Could not find an order reference to verify." }
  }

  try {
    const verified = await verifyTransaction(reference)
    if (verified.status === "success") {
      const metadata = verified.metadata
      if (metadata && metadata.orderType === "direct_bundle") {
        await fulfillDirectBundleOrder(reference, metadata)
        return {
          ok: true,
          title: "Payment Confirmed & Bundle Delivering!",
          description: `Your ${String(metadata.network).toUpperCase()} ${metadata.dataSize}GB bundle is being delivered to ${metadata.recipient}. Most deliveries complete in minutes.`,
        }
      }
      return {
        ok: true,
        title: "Payment Successful",
        description: "Your payment was confirmed. Your bundle is being processed.",
      }
    }
    return {
      ok: false,
      title: "Payment Unsuccessful",
      description: "Paystack reported this transaction was not completed. If money was deducted, it will be refunded.",
    }
  } catch (err: any) {
    console.error("Order verification error:", err.message)
    return {
      ok: false,
      title: "Verification in Progress",
      description: "We are confirming your payment with Paystack. Your bundle will be delivered as soon as it is processed.",
    }
  }
}
