"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export type LoginPortal = "customer" | "staff"

// Customers sign up for themselves; staff bring a whole organization with them.
const SIGN_UP_CTA: Record<LoginPortal, { label: string; href: string; placeholder: string }> = {
  customer: { label: "Sign up", href: "/customer/register", placeholder: "you@example.com" },
  staff: { label: "Register your business", href: "/register", placeholder: "you@company.com" },
}

// A rejected sign-in now means "not valid *for this portal*", because the portal
// is sent to the server and scopes which identity table is checked. The same
// address can hold both a customer and a staff account with different passwords,
// so point people at the other door instead of leaving them stuck here.
const WRONG_PORTAL_HINT: Record<LoginPortal, { message: string; label: string; href: string }> = {
  customer: {
    message: "That email and password don't match a customer account.",
    label: "Staff sign in here",
    href: "/login?portal=staff",
  },
  staff: {
    message: "That email and password don't match a staff account.",
    label: "Customer sign in here",
    href: "/login?portal=customer",
  },
}

export function LoginForm({ portal = "staff" }: { portal?: LoginPortal }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const cta = SIGN_UP_CTA[portal]
  const hint = WRONG_PORTAL_HINT[portal]
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      // Without this the server checks the customer table, then falls through to
      // the staff table on a password mismatch — so a customer who mistyped
      // could end up in the staff dashboard.
      portal,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError(hint.message)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder={cta.placeholder} {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            // tabIndex -1 keeps Tab going straight from the password field to
            // Sign in, the way it did before the toggle existed.
            tabIndex={-1}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="space-y-1 text-sm">
          <p className="text-destructive">{error}</p>
          <Link href={hint.href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {hint.label}
          </Link>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link href={cta.href} className="text-foreground underline-offset-4 hover:underline">
          {cta.label}
        </Link>
      </p>
    </form>
  )
}
