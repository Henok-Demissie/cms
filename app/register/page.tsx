import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { BackButton } from "@/components/back-button"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <BackButton fallbackHref="/" className="mb-6" />
        <div className="mb-5 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-lg font-medium">AbetBay</span>
          </Link>
          <h1 className="font-serif text-3xl font-normal mb-1">Register your business</h1>
          <p className="text-sm text-muted-foreground">
            Create your tenant, pick a sector, and start managing complaints.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
