"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type MessageFormProps = {
  id: string
  label: string
  placeholder: string
  submitLabel?: string
  successMessage?: string
}

export function MessageForm({
  id,
  label,
  placeholder,
  submitLabel = "Submit",
  successMessage = "Thank you! Your message has been submitted.",
}: MessageFormProps) {
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return

    setSubmitted(true)
    setMessage("")
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{successMessage}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Write another
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-left"
    >
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={placeholder}
          className="min-h-32"
          maxLength={2000}
          required
        />
      </div>
      <Button type="submit" className="mt-4" disabled={!message.trim()}>
        {submitLabel}
      </Button>
    </form>
  )
}
