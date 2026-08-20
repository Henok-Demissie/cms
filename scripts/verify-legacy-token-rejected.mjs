// A session token issued before lib/session-guard.ts existed carries no
// password fingerprint. Confirm such a token is treated as stale and signed out
// rather than silently trusted — this is what every already-signed-in browser
// is holding right now.
//
//   node scripts/verify-legacy-token-rejected.mjs
//
// localhost only: it has to sign a token, which needs AUTH_SECRET. The signed
// production build runs this identical code path.
import { readFileSync } from "node:fs"
import { encode } from "next-auth/jwt"
import { PrismaClient } from "@prisma/client"

const BASE = "http://localhost:3000"

const secret = readFileSync(".env", "utf8")
  .split("\n")
  .map((l) => l.match(/^\s*AUTH_SECRET\s*=\s*"?([^"\n]+)"?/))
  .find(Boolean)?.[1]
if (!secret) {
  console.error("AUTH_SECRET not found in .env")
  process.exit(1)
}

const prisma = new PrismaClient()
const staff = await prisma.user.findFirst({ select: { id: true, name: true, email: true, role: true, tenantId: true } })
await prisma.$disconnect()

// Over http the cookie is unprefixed; Auth.js uses the cookie name as the salt.
const COOKIE = "authjs.session-token"

async function probe(label, claims) {
  const token = await encode({ token: claims, secret, salt: COOKIE, maxAge: 60 * 60 })
  const res = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: `${COOKIE}=${token}` },
    redirect: "manual",
  })
  const location = res.headers.get("location") ?? "(no redirect — dashboard served)"
  console.log(`${label}\n      HTTP ${res.status} -> ${location}`)
  return location
}

const base = {
  sub: staff.id,
  id: staff.id,
  name: staff.name,
  email: staff.email,
  role: staff.role,
  tenantId: staff.tenantId,
  accountType: "staff",
}

const legacy = await probe("legacy token (no passwordFingerprint)", base)
const forged = await probe("token with a wrong passwordFingerprint", { ...base, passwordFingerprint: "deadbeefdeadbeef" })

const ok =
  legacy.includes("/logout?reason=session-expired") &&
  forged.includes("/logout?reason=password-changed")

console.log(`\n${ok ? "PASS" : "FAIL"}: pre-guard and tampered tokens are both signed out`)
process.exit(ok ? 0 : 1)
