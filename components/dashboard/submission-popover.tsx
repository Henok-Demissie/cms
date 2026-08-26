"use client"

import * as React from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { FormResult } from "@/lib/form-result"
import { cn } from "@/lib/utils"

type SubmissionPopoverProps = {
  /** Label on the button that opens the popover. */
  triggerLabel: string
  title: string
  description?: string
  submitLabel: string
  successMessage: string
  action: (formData: FormData) => Promise<FormResult>
  /** The form fields — rendered by the calling page so org lists stay server-rendered. */
  children: React.ReactNode
  className?: string
}

export function SubmissionPopover({
  triggerLabel,
  title,
  description,
  submitLabel,
  successMessage,
  action,
  children,
  className,
}: SubmissionPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const formRef = React.useRef<HTMLFormElement>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError(null)

    startTransition(async () => {
      const result = await action(formData)
      if (result.ok) {
        form.reset()
        setOpen(false)
        toast.success(result.message ?? successMessage)
      } else {
        setError(result.error)
      }
    })
  }

  function handleOpenChange(next: boolean) {
    // Don't let an outside click or Escape discard a submission in flight.
    if (pending) return
    if (!next) setError(null)
    setOpen(next)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={cn("w-[min(92vw,26rem)] p-0", className)}
        // Radix would otherwise pull focus to the popover root; the first field is better.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const first = formRef.current?.querySelector<HTMLElement>(
            "input:not([type=hidden]), select, textarea",
          )
          first?.focus()
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3">{children}</div>

          {error && (
            <p
              role="alert"
              className="mx-4 mb-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {pending ? "Submitting…" : submitLabel}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
