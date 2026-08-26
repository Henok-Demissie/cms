"use client"

import * as React from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { FormResult } from "@/lib/form-result"
import { cn } from "@/lib/utils"

type SubmissionPopoverProps = {
  /** Label on the button that opens the form. */
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

/**
 * Submission form that opens centred on the screen instead of anchored to its
 * button, so complaints, suggestions and feedback all use the same overlay.
 */
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("w-[min(92vw,28rem)] p-0", className)}
        // No corner X: the footer already has Cancel, and two ways to dismiss the
        // same form is one too many.
        showCloseButton={false}
        // Radix would otherwise pull focus to the dialog root; the first field is better.
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
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription className="mt-0.5">{description}</DialogDescription>}
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
      </DialogContent>
    </Dialog>
  )
}
