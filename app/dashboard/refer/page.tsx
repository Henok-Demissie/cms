import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/brand/page-header"
import { ReferralInviteCard } from "@/components/referrals/referral-invite-card"
import { auth } from "@/lib/auth"

export default async function ReferPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const code = session.user.id.slice(-8).toUpperCase()
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://cms-virid-iota.vercel.app"
  const link = `${origin}/sign-up?ref=${encodeURIComponent(code)}`

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <PageHeader title="Referrals" subtitle="Invite friends and track verified rewards." />
      <ReferralInviteCard code={code} link={link} />
    </div>
  )
}
