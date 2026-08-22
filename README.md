# AbetBay — CMS

Multi-tenant complaint management for Ethiopian service organizations. Each
organization gets isolated data and its own path-based storefront; customers file
complaints from the web or the Android app; staff triage them from a dashboard.

| | |
|---|---|
| **Web app** | https://cms-eth.vercel.app |
| **Android app** | [Download APK](https://expo.dev/artifacts/eas/aZcWcdcoyBuoyIoRh_qCf-8c8PpfV1Cfh42EvkEoKQo.apk) — v1.0.0, built 2026-08-20 |
| **Build details** | [EAS build `2fdc41d7`](https://expo.dev/accounts/hencha/projects/abetbay/builds/2fdc41d7-a73f-4d1e-bebe-d4e34e44ebe2) · [all builds](https://expo.dev/accounts/hencha/projects/abetbay) |

> The APK is an `internal` distribution artifact, so Expo expires it on
> **2026-09-03**. Past that date the link 404s — see [Mobile builds](#mobile-builds)
> to cut a fresh one. Android will warn about installing outside the Play Store.

## What it does

Two audiences share one deployment, entering through separate doors:

**Customers** register once, globally, and can file against any organization on
the platform. They track their own cases at `/dashboard/my-complaints`, leave
suggestions and feedback, and get notified when staff respond.

**Staff** belong to exactly one organization (`Tenant`) and only ever see that
organization's data. Roles are `ADMIN`, `SUPERVISOR`, `AGENT`, and `VIEWER`
(`lib/constants.ts`). They triage the queue at `/dashboard/complaints` — assign
an owner, move status, set priority, and reply on a per-complaint thread.

A complaint moves `NEW → IN_PROGRESS → RESOLVED → CLOSED`, with `ESCALATED`
available at any point. Separately, the customer who filed it can withdraw it —
`WITHDRAWN` is customer-initiated and refused once a complaint is resolved or
closed. Priority is one of `LOW`, `MEDIUM`, `HIGH`, `URGENT`, `CRITICAL`, and
`source` records whether it arrived from `WEB` or `MOBILE`.

Organizations are typed by sector (`RESTAURANT`, `HEALTHCARE`, `RETAIL`,
`BANKING`, `HOSPITALITY`, `TELECOM`, `GOVERNMENT`, `MANUFACTURING`) and carry a
plan of `STARTER`, `PROFESSIONAL`, or `ENTERPRISE`.

Each organization also gets a public storefront at `/org/[subdomain]` where
customers can file without hunting through a directory first.

Customer-facing copy is bilingual Amharic / English (`AM` is the default; see
`lib/customer-registration-i18n.ts` and `lib/marketing-i18n.ts`), and each
account stores its own language preference.

## Architecture

### Two identity tables, not one

`Customer` and `User` are separate models, and this is deliberate rather than
legacy. Customers are global — one account files against many organizations, so
scoping them to a tenant would be wrong. Staff are tenant-scoped, and cascade
with the tenant they belong to.

The cost is that one email address can exist in both tables, which makes "log
this person in" ambiguous. Login therefore takes an explicit `portal`:

```
POST /api/v1/auth/login  { email, password, portal: "customer" | "staff" }
```

`portal` is optional so older app builds keep working, but when it is missing and
the address exists in both tables, `lib/auth-service.ts` returns **409** rather
than guessing which door was meant. `isAmbiguousIdentifier()` is the check;
`scripts/audit-duplicate-identities.mjs` reports existing collisions.

### Sessions end when the password changes

Both the NextAuth session and the mobile API token carry a
`passwordFingerprint` — a hash of the stored password hash. Every request
re-derives it and signs the caller out on a mismatch, so a password change
invalidates tokens already in the wild without a revocation list.

### One API, two clients

The mobile app talks to this repo's `/api/v1/*` routes — there is no separate
API server. Web sessions use NextAuth cookies; mobile uses a JWT signed by
`lib/jwt.ts` (`jose`) and verified in `lib/api/mobile-auth.ts`.

| Route | Methods | Purpose |
|---|---|---|
| `/api/v1/auth/login` | `POST` | Portal-scoped login, returns an API token |
| `/api/v1/auth/register` | `POST` | Staff / organization registration |
| `/api/v1/auth/register-customer` | `POST` | Customer registration |
| `/api/v1/mobile/dashboard` | `GET` | Counts and recent activity for the home screen |
| `/api/v1/mobile/complaints` | `GET` `POST` | List and file complaints |
| `/api/v1/mobile/complaints/[id]` | `GET` `POST` `PATCH` `DELETE` | Read with thread · reply · edit own · withdraw own |
| `/api/v1/mobile/suggestions` | `GET` `POST` | List and submit suggestions |
| `/api/v1/mobile/suggestions/[id]/respond` | `POST` | Staff response |
| `/api/v1/mobile/feedback` | `GET` `POST` | List and submit feedback |
| `/api/v1/mobile/feedback/[id]/respond` | `POST` | Staff response |
| `/api/v1/mobile/notifications` | `GET` `PATCH` | List, and mark one or all read (customers only) |
| `/api/v1/organizations` | `GET` | Public organization directory |

On the complaint detail route, `PATCH` and `DELETE` are restricted to the
customer who filed it — staff move complaints through the dashboard, not through
these endpoints.

### Data model

`Tenant` → `User` (staff), `Complaint`, `Suggestion`, `Feedback`.
`Customer` → the same three, plus `Notification`.
`Complaint` → `ComplaintMessage` (the thread) and `ComplaintReaction`.

Schema is plain scalars throughout — no enums, `Json`, `Bytes`, `Decimal`, or
native `@db.` annotations. Status and priority are validated in application code.

## Stack

| Part | What |
|---|---|
| Web | Next.js 16 (App Router), React 19, Tailwind v4, Radix UI |
| Auth | NextAuth v5 (credentials, JWT sessions) + bcrypt |
| Database | Supabase Postgres (eu-central-1) via Prisma 5 |
| Mobile | Expo SDK 54 / React Native 0.81, React Navigation 7 |
| Hosting | Vercel, functions pinned to `fra1` |

## Repo layout

```
app/                    Next.js App Router — marketing, auth, dashboard, /api/v1
  dashboard/            Staff triage + customer self-service views
  org/[subdomain]/      Per-organization public storefront
apps/mobile/            Expo app (com.abetbay.app)
lib/                    auth-service, jwt, prisma, notifications, session-guard
prisma/schema.prisma    Data model
scripts/                Seeds, verification scripts, one-off migrations, QR helpers
backend/                Dormant FastAPI service — see below
```

### About `backend/`

A FastAPI service that is **not deployed and not used**. Nothing imports
`lib/api/backend-client.ts`, the only file that reads `BACKEND_URL`. It is
excluded from deployments via `.vercelignore`. Kept for reference only; deleting
it would not affect the web or mobile apps.

## Local development

```bash
pnpm install
pnpm dev            # Next.js on :3000  (next dev --webpack)
pnpm mobile:start   # Expo / Metro on :8081
```

The mobile app reads `EXPO_PUBLIC_API_URL` and falls back to
`http://localhost:3000`, which a phone cannot reach — point it at your machine's
LAN address or at production when testing on a device.

### Running the app on a phone

```bash
node scripts/show-qr.mjs          # QR in the terminal
node scripts/generate-expo-qr.mjs # regenerate public/qr.html
```

Both detect the host's LAN address at run time instead of hardcoding one, so
they stay correct when the machine changes network. On WSL, Metro listens inside
WSL while the phone connects to the Windows host, so host port forwarding must be
active first — run `C:\Users\HP\wsl-expo-portproxy.ps1` in an admin PowerShell.

`public/qr.html` is a static file served from Vercel, so its address is baked in
at generation time; rerun `generate-expo-qr.mjs` and redeploy after a network
change.

### Environment

`.env` at the repo root (gitignored):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase **transaction** pooler, port `6543`, with `?pgbouncer=true`. Used at runtime. |
| `DIRECT_URL` | Supabase **session** pooler, port `5432`. Used by `prisma migrate`, which needs a direct connection. |
| `AUTH_SECRET` | NextAuth signing secret. |

Both pooler URLs are required. Prisma cannot run migrations through the
transaction pooler, and the app should not hold direct connections from
serverless functions.

`AUTH_URL` / `NEXTAUTH_URL` are not needed — `trustHost: true` is set in
`auth.config.ts`, so the host is inferred from the request.

## Database

```bash
pnpm db:migrate     # create + apply a migration
pnpm db:generate    # regenerate the Prisma client
pnpm db:push        # push schema without a migration (dev only)
pnpm db:seed        # seed an admin account
```

`scripts/migrate-sqlite-to-postgres.mjs` is the one-off importer used to move off
the original SQLite database. Kept for reference; it should not need to run again.

## Mobile builds

`apps/mobile/eas.json` defines two profiles. Both pin `EXPO_PUBLIC_API_URL` to
production.

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview      # internal APK
npx eas-cli build --platform android --profile production   # store build, autoIncrement
```

`EXPO_PUBLIC_API_URL` lives in `eas.json` rather than `apps/mobile/.env` on
purpose: `.gitignore` covers `.env*` and EAS uploads by `.gitignore`, so the
build would never receive the file and `api.ts` would fall back to
`http://localhost:3000` — an APK that cannot reach anything from a phone. There
is deliberately no `.easignore`, since adding one overrides `.gitignore` and
would start uploading local `.env` files to the build servers.

## Verification scripts

Standalone checks, mostly written alongside the auth work. Each runs against the
configured database.

```bash
node scripts/verify-portal-login.mjs           # portal scoping holds
node scripts/verify-session-invalidation.mjs   # password change ends sessions
node scripts/verify-legacy-token-rejected.mjs  # pre-fingerprint tokens rejected
node scripts/verify-no-password-bypass.mjs
node scripts/verify-mobile-login.mjs
node scripts/verify-dashboard-data.mjs
node scripts/test-dual-table-workflow.mjs      # end-to-end across both identity tables
node scripts/audit-duplicate-identities.mjs    # addresses present in both tables
```

## Security

```bash
node scripts/audit-weak-passwords.mjs    # read-only report
node scripts/rotate-weak-passwords.mjs   # replace defaults with random values
```

The seed scripts create accounts with hardcoded passwords. Run the audit after
seeding, and rotate before exposing an environment publicly.

## Deployment

Pushes to `main` deploy automatically. To deploy by hand:

```bash
vercel login
bash scripts/deploy-vercel.sh
```

That script links the project, uploads production environment variables from
`.env.vercel-import`, and deploys. Values are piped on stdin rather than passed
as arguments so they never appear in `argv`.

The Vercel project's framework preset must stay **Next.js**. If the CLI is
allowed to auto-detect, it sees `backend/` and guesses `Services`, then writes a
multi-service block into `vercel.json` and the deploy fails looking for
`services/backend/config.json`.

## Notes

`next.config.mjs` still sets `typescript.ignoreBuildErrors: true`, but the type
errors it was hiding are fixed — `tsc --noEmit` is clean at the repo root and in
`apps/mobile`. The flag can be removed whenever someone wants to enforce it in
CI.
