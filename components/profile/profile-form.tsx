"use client"

import { useState, useTransition } from "react"
import { Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfile } from "@/app/actions/profile"

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name, phone })

  function save() {
    startTransition(async () => {
      const result = await updateProfile(form)
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div className="card-shadow flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="title-bar text-sm font-bold">Personal information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Full name</label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 text-base sm:text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">Phone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 pl-10 text-base sm:text-sm" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="email" type="email" value={email} readOnly className="h-11 pl-10 text-base sm:text-sm" />
          </div>
        </div>
      </div>
      <Button type="button" onClick={save} disabled={isPending} className="brand-gradient brand-glow h-11 w-fit px-6 font-bold text-brand-deep hover:opacity-90">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  )
}
