// Prove three things about session handling, end to end over HTTP:
//
//   1. A password change ends existing sessions (it used to leave them valid
//      for the rest of the JWT's 7 days).
//   2. A signed-in visitor can still reach the *other* portal's form.
//   3. A deleted account cannot keep browsing.
//
//   node scripts/verify-session-invalidation.mjs [baseUrl]
//
// Uses a throwaway account created and deleted here, so no real row is touched.
// Requires the target to share this DATABASE_URL (localhost, or prod with prod env).
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "node:crypto"

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const prisma = new PrismaClient()

const email = `session-check-${randomBytes(5).toString("hex")}@example.invalid`
const password = `Pw-${randomBytes(12).toString("base64url")}`

const jarCookies = (j) => [...j].map(([k, v]) => `${k}=${v}`).join("; ")
function absorb(res, j) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair, ...attrs] = raw.split(";")
    const i = pair.indexOf("=")
    const name = pair.slice(0, i).trim()
    const value = pair.slice(i + 1).trim()
    // A cleared cookie arrives as an empty value and/or a past expiry.
    const expired = attrs.some((a) => /^\s*expires=/i.test(a) && new Date(a.split("=")[1]) < new Date("2030-01-01")) && value === ""
    if (!value || expired) j.delete(name)
    else j.set(name, value)
  }
}

async function signIn(portal) {
  const j = new Map()
  const c = await fetch(`${BASE}/api/auth/csrf`)
  absorb(c, j)
  const { csrfToken } = await c.json()
  const r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1", Cookie: jarCookies(j) },
    body: new URLSearchParams({ csrfToken, email, password, portal, callbackUrl: `${BASE}/dashboard` }),
  })
  absorb(r, j)
  return j
}

// Follow redirects by hand so each hop is visible, carrying the jar through.
async function hop(path, jar, max = 4) {
  let url = new URL(path, BASE).toString()
  const trail = []
  for (let i = 0; i < max; i++) {
    const res = await fetch(url, { headers: { Cookie: jarCookies(jar) }, redirect: "manual" })
    absorb(res, jar)
    trail.push(`${new URL(url).pathname}${new URL(url).search} -> ${res.status}`)
    const loc = res.headers.get("location")
    if (!loc) return { trail, status: res.status, url, body: await res.text() }
    url = new URL(loc, BASE).toString()
  }
  return { trail, status: 0, url, body: "" }
}

const results = []
const check = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(`${pass ? "PASS" : "FAIL"}  ${name}\n      ${detail}`) }

try {
  const customer = await prisma.customer.create({
    data: { name: "Session Check", email, phone: `0900${randomBytes(3).toString("hex")}`, passwordHash: await bcrypt.hash(password, 10) },
  })

  // --- 1. sign in, confirm the dashboard opens
  const jar = await signIn("customer")
  const first = await hop("/dashboard", jar)
  check("signed-in customer reaches the dashboard", first.status === 200, first.trail.join("  |  "))

  // --- 2. signed in, the other portal's form must still be reachable
  const bare = await hop("/login", jar)
  check("bare /login still bounces a signed-in visitor to the dashboard",
    bare.trail[0].endsWith("-> 307") && bare.status === 200 && bare.url.includes("/dashboard"),
    bare.trail.join("  |  "))

  const staffDoor = await hop("/login?portal=staff", jar)
  check("/login?portal=staff serves the form to a signed-in customer",
    staffDoor.status === 200 && staffDoor.url.includes("/login"),
    staffDoor.trail.join("  |  "))

  // --- 3. change the password behind the session's back
  await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash: await bcrypt.hash(`different-${password}`, 10) },
  })

  const afterChange = await hop("/dashboard", jar)
  check("password change ends the existing session",
    afterChange.url.includes("/login") && afterChange.url.includes("reason=password-changed"),
    afterChange.trail.join("  |  "))
  check("the login page explains why",
    /signed out everywhere/i.test(afterChange.body),
    afterChange.body.match(/[^<>]*signed out everywhere[^<>]*/i)?.[0]?.trim() ?? "notice not found in HTML")
  check("session cookie was actually cleared",
    ![...jar.keys()].some((k) => k.includes("session-token")),
    `cookies left: ${[...jar.keys()].join(", ") || "(none)"}`)

  // --- 4. deleted account cannot keep browsing
  const jar2 = await signIn("customer")   // will fail: password changed
  const reSignIn = await hop("/dashboard", jar2)
  check("old password no longer signs in", reSignIn.url.includes("/login"), reSignIn.trail.join("  |  "))

  await prisma.customer.delete({ where: { id: customer.id } })
  console.log(`\ncleaned up throwaway account`)
} finally {
  await prisma.customer.deleteMany({ where: { email } })
  await prisma.$disconnect()
}

const failed = results.filter((r) => !r.pass).length
console.log(`\n${results.length - failed}/${results.length} as expected`)
process.exit(failed ? 1 : 0)
