import Link from "next/link"
import { Suspense } from "react"
import { LoginForm, type LoginPortal } from "@/components/auth/login-form"
import { BackButton } from "@/components/back-button"

const PORTAL_COPY: Record<LoginPortal, { badge: string; heading: string; blurb: string }> = {
  customer: {
    badge: "Customer portal",
    heading: "Welcome back",
    blurb: "Sign in to raise a complaint and follow where it goes.",
  },
  staff: {
    badge: "Staff portal",
    heading: "Welcome back",
    blurb: "Sign in to manage complaints for your organization.",
  },
}

// Why the visitor was sent back here, set by app/logout/route.ts. Without this
// an expired session just looks like the app forgot who you were.
const SIGNED_OUT_NOTICE: Record<string, string> = {
  "password-changed": "Your password was changed, so you were signed out everywhere. Sign in with the new one.",
  "account-removed": "That account no longer exists.",
  "session-expired": "Your session expired. Please sign in again.",
  manual: "You have been signed out.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ portal?: string; reason?: string }>
}) {
  const { portal, reason } = await searchParams
  const audience: LoginPortal = portal === "customer" ? "customer" : "staff"
  const copy = PORTAL_COPY[audience]
  const notice = reason ? SIGNED_OUT_NOTICE[reason] : undefined

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <BackButton forceHref="/" className="mb-6" />
        <div className="mb-5 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-lg font-medium">AbetBay</span>
          </Link>
          <p className="mb-2">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {copy.badge}
            </span>
          </p>
          <h1 className="font-serif text-3xl font-normal mb-1">{copy.heading}</h1>
          <p className="text-sm text-muted-foreground">{copy.blurb}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          {notice && (
            <p
              role="status"
              className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
            >
              {notice}
            </p>
          )}
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <LoginForm portal={audience} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
