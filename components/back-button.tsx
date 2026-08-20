"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BackButtonProps = {
  fallbackHref?: string
  forceHref?: string
  label?: string
  className?: string
}

export function BackButton({
  fallbackHref = "/",
  forceHref,
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("w-fit text-muted-foreground", className)}
      onClick={() => {
        if (forceHref) {
          router.push(forceHref)
          return
        }

        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back()
          return
        }
        router.push(fallbackHref)
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
