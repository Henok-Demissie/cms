import { Users } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { EmptyState } from "@/components/brand/empty-state"

export default function ReferPage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <PageHeader title="Referrals" subtitle="Invite friends and track verified rewards." />
      <EmptyState
        icon={Users}
        title="No referrals yet"
        description="Verified referrals will appear here once the referral program is connected to real account data."
      />
    </div>
  )
}
