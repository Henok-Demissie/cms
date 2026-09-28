"use client"

import { useState, useTransition } from "react"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { bulkSyncOrders } from "@/app/actions/owner"
import { useRouter } from "next/navigation"

export function BulkSyncButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSync = () => {
    startTransition(async () => {
      const res = await bulkSyncOrders()
      if (res.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error("Bulk sync failed. Try again.")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleSync}
      className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
    >
      <RefreshCw className={`size-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Syncing all orders…" : "Sync All Orders"}
    </Button>
  )
}
