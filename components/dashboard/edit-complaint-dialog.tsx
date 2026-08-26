"use client"

import * as React from "react"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import { updateComplaint } from "@/app/dashboard/complaints/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type EditComplaintDialogProps = {
  id: string
  title: string
  description: string
  /** "icon" fits inside a table row; "button" is a labelled action for a detail page. */
  variant?: "icon" | "button"
}

/**
 * Lets the customer correct their own complaint, in the same centred overlay the
 * submission form uses.
 *
 * Only rendered while the complaint is still editable — NEW with no replies. The
 * server enforces that rule again, so a stale page cannot slip an edit past it.
 */
export function EditComplaintDialog({
  id,
  title,
  description,
  variant = "icon",
}: EditComplaintDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const formRef = React.useRef<HTMLFormElement>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)

    startTransition(async () => {
      const result = await updateComplaint(formData)
      if (result.ok) {
        setOpen(false)
        toast.success(result.message ?? "Complaint updated")
      } else {
        setError(result.error)
      }
    })
  }

  function handleOpenChange(next: boolean) {
    // Don't let an outside click or Escape discard a save in flight.
    if (pending) return
    if (!next) setError(null)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === "button" ? (
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
            Edit complaint
          </button>
        ) : (
          <button
            type="button"
            title="Edit this complaint"
            aria-label="Edit this complaint"
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent
        className="w-[min(92vw,28rem)] p-0"
        // The footer has Cancel; a corner X on top of it is one dismissal too many.
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          formRef.current?.querySelector<HTMLElement>("input, textarea")?.focus()
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* The id travels with the form so the action needs no bound argument. */}
          <input type="hidden" name="id" value={id} />

          <div className="border-b border-border px-4 py-3">
            <DialogTitle>Edit complaint</DialogTitle>
            <DialogDescription className="mt-0.5">
              You can still change this while no one from the organization has replied.
            </DialogDescription>
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-title-${id}`}>Complaint title</Label>
              <Input
                id={`edit-title-${id}`}
                name="title"
                defaultValue={title}
                minLength={3}
                maxLength={150}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-description-${id}`}>Description</Label>
              <Textarea
                id={`edit-description-${id}`}
                name="description"
                defaultValue={description}
                rows={5}
                minLength={10}
                maxLength={5000}
                required
              />
            </div>
          </div>

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
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
