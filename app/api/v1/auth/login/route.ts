import { z } from "zod"
import { apiError, apiSuccess } from "@/lib/api-response"
import { authenticateUser } from "@/lib/auth-service"
import { signApiToken } from "@/lib/jwt"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400)
    }

    const user = await authenticateUser(parsed.data.email, parsed.data.password)
    if (!user) {
      return apiError("Invalid email or password", 401)
    }

    const token = await signApiToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    })

    return apiSuccess({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    })
  } catch {
    return apiError("Login failed", 500)
  }
}
