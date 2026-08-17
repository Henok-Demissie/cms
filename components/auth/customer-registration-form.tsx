"use client"

import Link from "next/link"
import { useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { ArrowLeft, Eye, EyeOff, IdCard, Mail, Phone, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/marketing/theme-toggle"

type FormValues = {
  firstName: string
  lastName: string
  phone: string
  gender: "MALE" | "FEMALE"
  language: "AM" | "EN"
  email: string
  nationalId: string
  password: string
  confirmPassword: string
}

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  gender: "MALE",
  language: "AM",
  email: "",
  nationalId: "",
  password: "",
  confirmPassword: "",
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <Label className="text-xs font-medium text-foreground">{children}</Label>
}

export function CustomerRegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    const response = await fetch("/api/v1/auth/register-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    const result = await response.json()
    setIsSubmitting(false)

    if (!response.ok || !result.success) {
      setError(result.error ?? "Unable to create your account. Please try again.")
      return
    }

    window.location.assign("/login?portal=customer&registered=true")
  }

  return (
    <main className="flex min-h-screen items-center bg-background px-4 py-2 sm:px-6">
      <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex items-center justify-between">
          <Link href="/login?portal=customer" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to Login
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-3">
          <h1 className="font-serif text-xl font-semibold tracking-tight">Customer Registration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account to access our services</p>
          <p className="mt-2 text-xs text-primary">የእኛን አገልግሎቶች ለመጠቀም መለያዎን ይፍጠሩ</p>
        </div>

        <form onSubmit={onSubmit} className="mt-3 space-y-2 [&_[data-slot=input]]:h-8 [&_[data-slot=select-trigger]]:h-8">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel>First Name / ስም *</FieldLabel>
              <div className="relative"><UserRound className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Enter first name" value={values.firstName} onChange={(e) => update("firstName", e.target.value)} required /></div>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Last Name / የአባት ስም *</FieldLabel>
              <Input placeholder="Enter last name" value={values.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Phone Number / ስልክ ቁጥር *</FieldLabel>
            <div className="relative"><Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" inputMode="tel" placeholder="0911234567" value={values.phone} onChange={(e) => update("phone", e.target.value)} required /></div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="space-y-1.5"><FieldLabel>Gender / ጾታ *</FieldLabel><Select value={values.gender} onValueChange={(value) => update("gender", value as FormValues["gender"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MALE">Male / ወንድ</SelectItem><SelectItem value="FEMALE">Female / ሴት</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><FieldLabel>Language / ቋንቋ</FieldLabel><Select value={values.language} onValueChange={(value) => update("language", value as FormValues["language"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="AM">Amharic / አማርኛ</SelectItem><SelectItem value="EN">English</SelectItem></SelectContent></Select></div>
          </div>

          <div className="space-y-1.5"><FieldLabel>Email (Optional) / ኢሜይል</FieldLabel><div className="relative"><Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="email" placeholder="your@email.com" value={values.email} onChange={(e) => update("email", e.target.value)} /></div></div>
          <div className="space-y-1.5"><FieldLabel>National ID (Optional) / መታወቂያ ቁጥር</FieldLabel><div className="relative"><IdCard className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Enter national ID" value={values.nationalId} onChange={(e) => update("nationalId", e.target.value)} /></div></div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="space-y-1.5"><FieldLabel>Password / የይለፍ ቃል *</FieldLabel><div className="relative"><Input className="pr-9" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={values.password} onChange={(e) => update("password", e.target.value)} minLength={6} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button></div></div>
            <div className="space-y-1.5"><FieldLabel>Confirm / አረጋግጥ *</FieldLabel><div className="relative"><Input className="pr-9" type={showConfirmation ? "text" : "password"} placeholder="Confirm password" value={values.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} minLength={6} required /><button type="button" onClick={() => setShowConfirmation(!showConfirmation)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">{showConfirmation ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button></div></div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Registering..." : "Register / መመዝገብ"}</Button>
          <p className="pt-0.5 text-center text-xs text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" href="/login?portal=customer">Sign in</Link></p>
        </form>
      </div>
    </main>
  )
}
