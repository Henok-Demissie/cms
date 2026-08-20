"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

// Delete is destructive and there is no undo, so the button arms itself on the
// first click and only calls the server on the second. Two clicks in the same
// spot beats a native confirm() dialog, which cannot be styled and reads as a
// browser warning rather than part of the app.

type DeleteAction = (id: string) => Promise<{ ok: boolean; error?: string }>

type DeleteSubmissionButtonProps = {
  id: string
  action: DeleteAction
  /** Used in the tooltip and error copy, e.g. "complaint", "suggestion". */
  itemLabel?: string
  /** Navigate here on success. Omit to just refresh the current page. */
  redirectTo?: string
  /** "icon" fits inside a table row; "button" is a labelled action for a detail page. */
  variant?: "icon" | "button"
}

export function DeleteSubmissionButton({
  id,
  action,
  itemLabel = "submission",
  redirectTo,
  variant = "icon",
}: DeleteSubmissionButtonProps) {
  const router = useRouter()
  const [armed, setArmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function erase() {
    setError(null)
    startTransition(async () => {
      const result = await action(id)

      if (!result?.ok) {
        setError(result?.error ?? `Could not delete this ${itemLabel}.`)
        setArmed(false)
        return
      }

      setArmed(false)
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      {armed ? (
        <div className="inline-flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Erase permanently?</span>
          <button
            type="button"
            onClick={erase}
            disabled={isPending}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-destructive px-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            {isPending ? "Erasing…" : "Yes, delete"}
          </button>
          <button
            type="button"
            onClick={() => {
              setArmed(false)
              setError(null)
            }}
            disabled={isPending}
            className="h-7 rounded-md border border-border px-2 text-[11px] font-medium transition-colors hover:bg-accent disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/40 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete {itemLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          title={`Delete this ${itemLabel}`}
          aria-label={`Delete this ${itemLabel}`}
          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {error && <p className="max-w-56 text-right text-[10px] leading-tight text-destructive">{error}</p>}
    </div>
  )
}
