import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-lg font-medium">ResolveHQ</span>
          </Link>
          <h1 className="font-serif text-3xl font-normal mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage complaints for your organization.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
