"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { clearTestErrorsAction } from "@/app/actions/owner"
import { useRouter } from "next/navigation"

export function ClearTestDataButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClear = () => {
    if (!confirm("Clear all test failed orders and reset float balance to real deposited funds only?")) {
      return
    }

    startTransition(async () => {
      const res = await clearTestErrorsAction()
      if (res.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to clear test data.")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClear}
      className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 text-xs h-9"
    >
      <Trash2 className={`size-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Clearing tests…" : "Clear Test Errors & Float"}
    </Button>
  )
}
