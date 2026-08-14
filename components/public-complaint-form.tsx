"use client"

import { useActionState, useEffect, useRef } from "react"

import {
  submitPublicComplaint,
  type PublicComplaintState,
} from "@/app/org/[subdomain]/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState: PublicComplaintState = {
  success: false,
  message: "",
}

export function PublicComplaintForm({ subdomain }: { subdomain: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = submitPublicComplaint.bind(null, subdomain)
  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor="title">Complaint title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Briefly describe the issue"
          maxLength={150}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What happened?</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Tell us what happened and what outcome you expect."
          className="min-h-32"
          maxLength={5000}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Your name (optional)</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="Your name"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone (optional)</Label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            placeholder="+1 555 123 4567"
            maxLength={40}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerEmail">Email (optional)</Label>
        <Input
          id="customerEmail"
          name="customerEmail"
          type="email"
          placeholder="you@example.com"
          maxLength={254}
        />
      </div>

      <div className="absolute -left-[10000px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && (
        <p
          role="status"
          className={
            state.success
              ? "rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"
              : "rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit complaint"}
      </Button>
    </form>
  )
}
