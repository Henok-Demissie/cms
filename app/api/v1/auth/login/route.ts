import { z } from "zod"
import { apiError, apiSuccess } from "@/lib/api/response"
import { authenticateUser, isAmbiguousIdentifier } from "@/lib/auth-service"
import { signApiToken } from "@/lib/jwt"

const loginSchema = z.object({
  email: z.string().trim().min(3).max(254),
  password: z.string().min(6).max(128),
  // Which door the app's login screen was opened at. Optional so app builds
  // that predate it keep working, but without it an address that exists in
  // both identity tables is refused rather than guessed at.
  portal: z.enum(["customer", "staff"]).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Enter a valid email or phone number", 400)
    }

    const { email, password, portal } = parsed.data

    if (!portal && (await isAmbiguousIdentifier(email))) {
      return apiError(
        "This address has both a customer and a staff account. Update the app, then sign in from the portal you want.",
        409,
      )
    }

    const user = await authenticateUser(email, password, portal)
    if (!user) {
      return apiError("Invalid email or password", 401)
    }

    const token = await signApiToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      accountType: user.accountType,
      passwordFingerprint: user.passwordFingerprint,
    })

    return apiSuccess({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        accountType: user.accountType,
      },
    })
  } catch {
    return apiError("Login failed", 500)
  }
}
