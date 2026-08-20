// Exercise the real HTTP sign-in flow for every portal x account-type pair and
// assert which ones are supposed to succeed.
//
//   node scripts/verify-portal-login.mjs [baseUrl]
//
// Passwords are read from .env.rotated-credentials and never printed. Only
// PASS/FAIL and the resulting role reach stdout.
import { readFileSync } from "node:fs"

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

// The file is "# <table> / <role>" headers followed by "email  ->  password".
// Later entries win, so a reset appended at the end overrides an earlier value.
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

const CASES = [
  // portal        table       email                   should sign in?
  ["staff",    "staff",    "demo@example.com",     true,  "the staff account the user could not get in with"],
  ["staff",    "staff",    "user@example.com",     true,  "this address does have a real staff account"],
  ["customer", "staff",    "demo@example.com",     false, "staff password must not open the customer portal"],
  ["customer", "customer", "user@example.com",     true,  "customer identity, after the reset"],
  ["customer", "customer", "customer@example.com", true,  "customer-only address"],
  ["staff",    "customer", "user@example.com",     false, "THE BUG: customer creds must not open the staff portal"],
  ["staff",    "customer", "customer@example.com", false, "customer-only address must not open the staff portal"],
]

function parseCookies(response, jar) {
  for (const raw of response.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";")
    const index = pair.indexOf("=")
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}
const cookieHeader = (jar) => [...jar].map(([k, v]) => `${k}=${v}`).join("; ")

async function attempt(portal, email, password) {
  const jar = new Map()
  const csrfResponse = await fetch(`${BASE}/api/auth/csrf`)
  parseCookies(csrfResponse, jar)
  const { csrfToken } = await csrfResponse.json()

  const body = new URLSearchParams({ csrfToken, email, password, portal, callbackUrl: `${BASE}/dashboard` })
  const signIn = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
      Cookie: cookieHeader(jar),
    },
    body,
  })
  parseCookies(signIn, jar)
  const { url = "" } = await signIn.json().catch(() => ({}))
  if (/error=/.test(url)) return { ok: false }

  // A returned url is not proof on its own — confirm the session actually reads back.
  const session = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookieHeader(jar) } })
  const data = await session.json().catch(() => null)
  if (!data?.user) return { ok: false }
  return { ok: true, role: data.user.role, accountType: data.user.accountType, name: data.user.name }
}

console.log(`signing in against ${BASE}\n`)
let failures = 0
for (const [portal, table, email, expected, why] of CASES) {
  const password = creds.get(`${table}/${email.toLowerCase()}`)
  if (!password) {
    console.log(`SKIP  ${portal.padEnd(8)} ${table.padEnd(8)} ${email.padEnd(22)} no password on file`)
    continue
  }
  const result = await attempt(portal, email, password)
  const pass = result.ok === expected
  if (!pass) failures++
  const got = result.ok ? `signed in as ${result.role}/${result.accountType} "${result.name}"` : "rejected"
  console.log(`${pass ? "PASS" : "FAIL"}  ${portal.padEnd(8)} ${table.padEnd(8)} ${email.padEnd(22)} ${got}`)
  console.log(`      expected ${expected ? "success" : "rejection"} — ${why}`)
}
console.log(`\n${CASES.length - failures}/${CASES.length} as expected`)
process.exit(failures ? 1 : 0)
