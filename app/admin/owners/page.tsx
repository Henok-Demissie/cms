import Link from "next/link"
import { getOwnersAndAdminData, requireAdminOrOwner } from "@/lib/owner"
import { OwnersPlaceView } from "@/components/admin/owners-place-view"
import { ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function OwnersPlacePage() {
  const { isOwner } = await requireAdminOrOwner()
  const { owner, currentAdmin } = await getOwnersAndAdminData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
              <Link href="/admin">
                <ArrowLeft className="size-3 mr-1" />
                Back to Overview
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Crown className="size-6 text-amber-500" />
            <span>Owner&apos;s Place &amp; Admin</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Primary owner identity and single administrator assignment for Ghdatastore.
          </p>
        </div>
      </div>

      <OwnersPlaceView owner={owner} currentAdmin={currentAdmin} isOwner={isOwner} />
    </div>
  )
}
