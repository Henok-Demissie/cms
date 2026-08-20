// Sign in for real, then fetch the dashboard pages and count what renders.
//   node scripts/verify-dashboard-data.mjs [baseUrl]
import { readFileSync } from "node:fs"
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

const creds = new Map()
let table = null
for (const line of readFileSync(".env.rotated-credentials", "utf8").split("\n")) {
  const h = line.match(/^#\s*(customer|user)\b/i)
  if (h) { table = h[1].toLowerCase() === "user" ? "staff" : "customer"; continue }
  const e = line.match(/^(\S+@\S+)\s+->\s+(.+?)\s*$/)
  if (e && table) creds.set(`${table}/${e[1].toLowerCase()}`, e[2])
}

const jarCookies = (j) => [...j].map(([k, v]) => `${k}=${v}`).join("; ")
function absorb(res, j) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const p = raw.split(";")[0], i = p.indexOf("=")
    j.set(p.slice(0, i).trim(), p.slice(i + 1).trim())
  }
}

async function login(portal, tbl, email) {
  const j = new Map()
  const c = await fetch(`${BASE}/api/auth/csrf`); absorb(c, j)
  const { csrfToken } = await c.json()
  const r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1", Cookie: jarCookies(j) },
    body: new URLSearchParams({ csrfToken, email, password: creds.get(`${tbl}/${email}`), portal, callbackUrl: `${BASE}/dashboard` }),
  })
  absorb(r, j)
  return j
}

const count = (html, re) => (html.match(re) ?? []).length

for (const [portal, tbl, email, pages] of [
  ["staff", "staff", "demo@example.com", ["/dashboard", "/dashboard/complaints", "/dashboard/suggestions", "/dashboard/feedback"]],
  ["customer", "customer", "user@example.com", ["/dashboard", "/dashboard/my-complaints", "/dashboard/suggestions", "/dashboard/feedback"]],
]) {
  const jar = await login(portal, tbl, email)
  console.log(`\n=== ${email} (${portal} portal) ===`)
  for (const path of pages) {
    const res = await fetch(`${BASE}${path}`, { headers: { Cookie: jarCookies(jar) }, redirect: "manual" })
    if (res.status !== 200) { console.log(`  ${path.padEnd(28)} HTTP ${res.status} ${res.headers.get("location") ?? ""}`); continue }
    const html = await res.text()
    console.log(`  ${path.padEnd(28)} HTTP 200  rows=${count(html, /<tr\b/g)}  delete-buttons=${count(html, /Delete this (complaint|suggestion|feedback)/g)}`)
  }
}
