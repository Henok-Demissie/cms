import { redirect } from "next/navigation"
import type { Session } from "next-auth"
import { currentPasswordFingerprint, type AccountType } from "@/lib/auth-service"

/**
 * Confirm a session still reflects the account as it stands in the database.
 *
 * Sessions are JWTs, so they are self-contained: once issued, nothing checks
 * them against the row they came from. Two consequences worth closing:
 *
 *   - Resetting a password leaves the old session working for the rest of its
 *     7-day life. The reset looks like it did nothing.
 *   - Deleting an account leaves its holder signed in.
 *
 * Called from the dashboard layout, which runs in the Node runtime and so can
 * reach Prisma — the Edge middleware cannot, which is why this check lives here
 * rather than in the session callback.
 *
 * A stale session is sent to /logout, NOT straight to /login: the cookie has to
 * be cleared first, or middleware would see a logged-in request and bounce it
 * back to /dashboard forever.
 */
export async function assertSessionCurrent(session: Session | null): Promise<void> {
  if (!session?.user?.id) return

  const accountType: AccountType =
    session.user.accountType ?? (session.user.role === "CUSTOMER" ? "customer" : "staff")

  // Tokens issued before this check existed carry no fingerprint. Treat them as
  // stale so everyone re-authenticates once against the current passwords.
  if (!session.user.passwordFingerprint) {
    redirect("/logout?reason=session-expired")
  }

  const stored = await currentPasswordFingerprint(accountType, session.user.id)

  if (stored === null) {
    redirect("/logout?reason=account-removed")
  }
  if (stored !== session.user.passwordFingerprint) {
    redirect("/logout?reason=password-changed")
  }
}
