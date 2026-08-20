// The mobile app talks to POST /api/v1/auth/login and carries a bearer token,
// so none of the web session work applies to it. This drives that endpoint
// directly and asserts the same guarantees the browser now has:
//
//   A. portal x account-type: a customer's password must never return a staff
//      token, and vice versa.
//   B. a caller that sends no portal (an older app build) still works for an
//      address in one table, but is refused for one in both rather than guessed.
//   C. the token it hands back actually opens the mobile dashboard.
//   D. a password change ends the session instead of leaving the 8h token live.
//   E. a deleted account cannot keep using its token.
//   F. tokens minted before the fingerprint claim existed, or with a forged
//      one, are rejected.
//
//   node scripts/verify-mobile-login.mjs [baseUrl]
//
// Passwords come from .env.rotated-credentials and are never printed. D/E use a
// throwaway account created and deleted here, so no real row is touched; they
// need the target to share this DATABASE_URL. F is skipped unless the local
// AUTH_SECRET matches the target's (checked with a control token first).
import { readFileSync } from "node:fs"
import { createHash, randomBytes } from "node:crypto"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

const envFile = readFileSync(".env", "utf8")
const AUTH_SECRET = envFile
  .split("\n")
  .map((l) => l.match(/^\s*AUTH_SECRET\s*=\s*"?([^"\n]+)"?/))
  .find(Boolean)?.[1]

// "# <table>" headers followed by "email  ->  password"; later entries win.
const creds = new Map()
{
  let table = null
  for (const line of readFileSync(".env.rotated-credentials", "utf8").split("\n")) {
    const header = line.match(/^#\s*(customer|user|staff)\s+table|^#\s*(customer|user)\s*\//i)
    if (header) {
      const raw = (header[1] ?? header[2]).toLowerCase()
      table = raw === "user" ? "staff" : raw
      continue
    }
    const entry = line.match(/^(\S+@\S+)\s+->\s+(.+?)\s*$/)
    if (entry && table) creds.set(`${table}/${entry[1].toLowerCase()}`, entry[2])
  }
}

// Must match fingerprintPasswordHash() in lib/auth-service.ts.
const fingerprint = (passwordHash) =>
  createHash("sha256").update(passwordHash).digest("hex").slice(0, 16)

const results = []
function check(name, pass, detail) {
  results.push({ name, pass })
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}\n      ${detail}`)
}

async function apiLogin(email, password, portal) {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(portal ? { email, password, portal } : { email, password }),
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok && body.success === true, data: body.data, error: body.error }
}

async function apiDashboard(token) {
  const res = await fetch(`${BASE}/api/v1/mobile/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok && body.success === true, error: body.error }
}

console.log(`driving the mobile API at ${BASE}\n`)

// ---------------------------------------------------------------- A. portals
const CASES = [
  // portal        table       email                   should sign in?
  ["staff", "staff", "demo@example.com", true, "the staff account, from the staff door"],
  ["staff", "staff", "user@example.com", true, "this address does have a real staff account"],
  ["customer", "staff", "demo@example.com", false, "staff password must not open the customer portal"],
  ["customer", "customer", "user@example.com", true, "customer identity, after the reset"],
  ["customer", "customer", "customer@example.com", true, "customer-only address"],
  ["staff", "customer", "user@example.com", false, "THE BUG: customer creds must not mint a staff token"],
  ["staff", "customer", "customer@example.com", false, "customer-only address must not open the staff portal"],
]

let firstGoodToken = null
for (const [portal, table, email, expected, why] of CASES) {
  const password = creds.get(`${table}/${email.toLowerCase()}`)
  if (!password) {
    console.log(`SKIP  ${portal.padEnd(8)} ${table.padEnd(8)} ${email.padEnd(22)} no password on file`)
    continue
  }
  const r = await apiLogin(email, password, portal)
  const got = r.ok
    ? `HTTP ${r.status} token for ${r.data.user.role}/${r.data.user.accountType} "${r.data.user.name}"`
    : `HTTP ${r.status} ${r.error}`
  check(`${portal.padEnd(8)} portal, ${table.padEnd(8)} creds  ${email.padEnd(22)}`, r.ok === expected, `${got} — ${why}`)
  if (r.ok && !firstGoodToken) firstGoodToken = r.data.token
}

// ------------------------------------------- B. callers that send no portal
{
  const email = "customer@example.com"
  const password = creds.get(`customer/${email}`)
  if (password) {
    const r = await apiLogin(email, password)
    check("no portal, address in one table only: still signs in", r.ok, `HTTP ${r.status} ${r.ok ? r.data.user.accountType : r.error}`)
  }
}
{
  const email = "user@example.com"
  const password = creds.get(`customer/${email}`)
  if (password) {
    const r = await apiLogin(email, password)
    check(
      "no portal, address in BOTH tables: refused, not guessed",
      r.status === 409 && !r.ok,
      `HTTP ${r.status} ${r.error ?? "(token issued!)"}`,
    )
  }
}

// ------------------------------------------------- C. the token really works
if (firstGoodToken) {
  const d = await apiDashboard(firstGoodToken)
  check("the issued token opens the mobile dashboard", d.ok, `HTTP ${d.status} ${d.error ?? "dashboard returned"}`)
}

// ------------------------------- D/E. password change and account deletion
const prisma = new PrismaClient()
const throwawayEmail = `mobile-check-${randomBytes(5).toString("hex")}@example.invalid`
const throwawayPassword = `Pw-${randomBytes(12).toString("base64url")}`
let throwawayId = null

try {
  const created = await prisma.customer.create({
    data: {
      name: "Mobile Check",
      email: throwawayEmail,
      phone: `0900${randomBytes(3).toString("hex")}`,
      passwordHash: await bcrypt.hash(throwawayPassword, 10),
    },
  })
  throwawayId = created.id

  const signedIn = await apiLogin(throwawayEmail, throwawayPassword, "customer")
  check("throwaway customer signs in", signedIn.ok, `HTTP ${signedIn.status} ${signedIn.error ?? "token issued"}`)

  if (signedIn.ok) {
    const token = signedIn.data.token

    const before = await apiDashboard(token)
    check("its token works before the password changes", before.ok, `HTTP ${before.status}`)

    await prisma.customer.update({
      where: { id: throwawayId },
      data: { passwordHash: await bcrypt.hash(`different-${throwawayPassword}`, 10) },
    })

    const after = await apiDashboard(token)
    check(
      "password change ends the mobile session",
      after.status === 401 && !after.ok,
      `HTTP ${after.status} ${after.error ?? "(dashboard still served!)"}`,
    )

    const stale = await apiLogin(throwawayEmail, throwawayPassword, "customer")
    check("the old password no longer signs in", stale.status === 401, `HTTP ${stale.status} ${stale.error}`)

    // E. same token shape, but now the row is gone.
    const reSignIn = await apiLogin(throwawayEmail, `different-${throwawayPassword}`, "customer")
    if (reSignIn.ok) {
      await prisma.customer.delete({ where: { id: throwawayId } })
      throwawayId = null
      const deleted = await apiDashboard(reSignIn.data.token)
      check(
        "a deleted account cannot keep using its token",
        deleted.status === 401 && !deleted.ok,
        `HTTP ${deleted.status} ${deleted.error ?? "(dashboard still served!)"}`,
      )
    }
  }

  // ------------------------------------------- F. legacy and forged tokens
  if (!AUTH_SECRET) {
    console.log("SKIP  legacy/forged token checks — no AUTH_SECRET in .env")
  } else {
    const subject = await prisma.customer.findFirst({
      select: { id: true, email: true, name: true, passwordHash: true },
    })
    const key = new TextEncoder().encode(AUTH_SECRET)
    const mint = (extra) =>
      new SignJWT({ email: subject.email, name: subject.name, role: "CUSTOMER", tenantId: "public", accountType: "customer", ...extra })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(subject.id)
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(key)

    // Control: if a correctly-fingerprinted token is refused, our secret is not
    // the target's and the two probes below would pass for the wrong reason.
    const control = await apiDashboard(await mint({ passwordFingerprint: fingerprint(subject.passwordHash) }))
    if (!control.ok) {
      console.log(`SKIP  legacy/forged token checks — local AUTH_SECRET does not match ${BASE} (control HTTP ${control.status})`)
    } else {
      const legacy = await apiDashboard(await mint({}))
      check(
        "a token minted before the fingerprint claim is rejected",
        legacy.status === 401,
        `HTTP ${legacy.status} ${legacy.error ?? "(dashboard served!)"}`,
      )
      const forged = await apiDashboard(await mint({ passwordFingerprint: "deadbeefdeadbeef" }))
      check(
        "a token with a forged fingerprint is rejected",
        forged.status === 401,
        `HTTP ${forged.status} ${forged.error ?? "(dashboard served!)"}`,
      )
    }
  }
} finally {
  await prisma.customer.deleteMany({ where: { email: throwawayEmail } })
  await prisma.$disconnect()
  console.log("\ncleaned up the throwaway account")
}

const failed = results.filter((r) => !r.pass).length
console.log(`\n${results.length - failed}/${results.length} as expected`)
process.exit(failed ? 1 : 0)
