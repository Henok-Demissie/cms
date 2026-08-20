// Try to sign in WITHOUT a valid password, several ways, and confirm every
// attempt is refused. Also check what a stale session cookie still opens.
//
//   node scripts/verify-no-password-bypass.mjs [baseUrl]
//
// Read-only against the app's public HTTP surface. Prints no secrets.
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

const jarCookies = (j) => [...j].map(([k, v]) => `${k}=${v}`).join("; ")
function absorb(res, j) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const p = raw.split(";")[0], i = p.indexOf("=")
    j.set(p.slice(0, i).trim(), p.slice(i + 1).trim())
  }
}

async function attempt(label, fields) {
  const j = new Map()
  const c = await fetch(`${BASE}/api/auth/csrf`)
  absorb(c, j)
  const { csrfToken } = await c.json()

  const body = new URLSearchParams({ csrfToken, callbackUrl: `${BASE}/dashboard`, ...fields })
  const r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1", Cookie: jarCookies(j) },
    body,
  })
  absorb(r, j)

  // The only thing that counts as "signed in" is a session that reads back.
  const s = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: jarCookies(j) } })
  const data = await s.json().catch(() => null)
  const signedIn = Boolean(data?.user)

  // And whether the dashboard itself actually serves content to that jar.
  const d = await fetch(`${BASE}/dashboard`, { headers: { Cookie: jarCookies(j) }, redirect: "manual" })

  console.log(`${signedIn ? "!! SIGNED IN" : "refused    "}  /dashboard=${d.status}  ${label}`)
  return signedIn
}

console.log(`no-password bypass attempts against ${BASE}\n`)
let bypassed = 0
for (const [label, fields] of [
  ["empty password", { email: "demo@example.com", password: "", portal: "staff" }],
  ["password field absent", { email: "demo@example.com", portal: "staff" }],
  ["single space password", { email: "demo@example.com", password: " ", portal: "staff" }],
  ["whitespace password", { email: "demo@example.com", password: "        ", portal: "staff" }],
  ["wrong password", { email: "demo@example.com", password: "definitely-not-it", portal: "staff" }],
  ["old default 12345678", { email: "demo@example.com", password: "12345678", portal: "staff" }],
  ["empty password, no portal", { email: "demo@example.com", password: "" }],
  ["empty password, customer", { email: "user@example.com", password: "", portal: "customer" }],
  ["unknown email, empty password", { email: "nobody@example.com", password: "", portal: "staff" }],
  ["bcrypt hash as password", { email: "demo@example.com", password: "$2a$10$abcdefghijklmnopqrstuv", portal: "staff" }],
]) {
  if (await attempt(label, fields)) bypassed++
}

// A jar with no cookies at all must not reach the dashboard.
const bare = await fetch(`${BASE}/dashboard`, { redirect: "manual" })
console.log(`\nno cookie at all -> /dashboard HTTP ${bare.status} ${bare.headers.get("location") ?? ""}`)

// /login with no session must serve the form, not a redirect.
const loginPage = await fetch(`${BASE}/login`, { redirect: "manual" })
console.log(`no cookie at all -> /login     HTTP ${loginPage.status} ${loginPage.headers.get("location") ?? ""}`)

console.log(bypassed ? `\nFAIL: ${bypassed} attempt(s) got in without a valid password` : `\nPASS: every no-password attempt was refused`)
process.exit(bypassed ? 1 : 0)
