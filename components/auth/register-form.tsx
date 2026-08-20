"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { SECTORS } from "@/lib/constants"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sectors = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "RETAIL", label: "Retail / E-commerce" },
  { value: "BANKING", label: "Banking / Finance" },
  { value: "HOSPITALITY", label: "Hotels / Hospitality" },
  { value: "TELECOM", label: "Telecom / Utilities" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "MANUFACTURING", label: "Manufacturing / B2B" },
] as const satisfies ReadonlyArray<{ value: (typeof SECTORS)[number]; label: string }>

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required"),
  sector: z.enum(SECTORS),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sector: "RESTAURANT",
    },
  })

  const sector = watch("sector")

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    const result = await response.json()
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? "Registration failed")
      return
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      // This form only ever creates staff accounts, so scope the sign-in to the
      // staff table — otherwise a same-address customer account gets checked
      // first and could win.
      portal: "staff",
      redirect: false,
    })

    if (signInResult?.error) {
      router.push("/login")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Jane Smith" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" placeholder="Acme Bistro" {...register("businessName")} />
          {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Business sector</Label>
        <Select value={sector} onValueChange={(value) => setValue("sector", value as RegisterFormValues["sector"])}>
          <SelectTrigger>
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
