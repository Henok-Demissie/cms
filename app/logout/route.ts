import { NextResponse } from "next/server"
import { signOut } from "@/auth"

/**
 * Clear the session cookie, then send the visitor to the login form.
 *
 * lib/session-guard.ts redirects here when a session no longer matches the
 * database. It has to be a real request rather than a redirect straight to
 * /login, because only a route handler can delete the cookie — and until the
 * cookie is gone the middleware keeps treating the request as signed in and
 * bounces it back to /dashboard.
 *
 * GET, because a redirect() from a server component can only issue a GET. The
 * worst a forged request can do here is sign someone out.
 */
const REASONS = new Set(["password-changed", "account-removed", "session-expired", "manual"])

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("reason")
  const reason = requested && REASONS.has(requested) ? requested : "manual"

  await signOut({ redirect: false })

  const target = new URL(`/login?reason=${reason}`, new URL(request.url).origin)
  return NextResponse.redirect(target)
}
