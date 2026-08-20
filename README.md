# AbetBay — CMS

Multi-tenant complaint management. Organizations get isolated data and their own
path-based storefront; customers file complaints from the web or the mobile app;
staff triage them from a dashboard.

**Live:** https://cms-eth.vercel.app

## Stack

| Part | What |
|---|---|
| Web | Next.js 16 (App Router), React 19, Tailwind v4 |
| Auth | NextAuth v5 (credentials, JWT sessions) + bcrypt |
| Database | Supabase Postgres (eu-central-1) via Prisma 5 |
| Mobile | Expo SDK 54 / React Native 0.81 (`apps/mobile`) |
| Hosting | Vercel, functions pinned to `fra1` |

The mobile app talks to this repo's `/api/v1/*` routes — there is no separate
API server.

### About `backend/`

A FastAPI service that is **not deployed and not used**. Nothing imports
`lib/api/backend-client.ts`, the only file that reads `BACKEND_URL`. It is
excluded from deployments via `.vercelignore`. Kept for reference only; deleting
it would not affect the web or mobile apps.

## Local development

```bash
pnpm install
pnpm dev            # Next.js on :3000
pnpm mobile:start   # Expo / Metro on :8081
```

`pnpm dev` runs `next dev --webpack`.

### Environment

`.env` at the repo root (gitignored):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase **transaction** pooler, port `6543`, with `?pgbouncer=true`. Used at runtime. |
| `DIRECT_URL` | Supabase **session** pooler, port `5432`. Used by `prisma migrate`, which needs a direct connection. |
| `AUTH_SECRET` | NextAuth signing secret. |

`AUTH_URL` / `NEXTAUTH_URL` are not needed — `trustHost: true` is set in
`auth.config.ts`, so the host is inferred from the request.

Both pooler URLs are required. Prisma cannot run migrations through the
transaction pooler, and the app should not hold direct connections from
serverless functions.

## Database

```bash
pnpm db:migrate     # create + apply a migration
pnpm db:generate    # regenerate the Prisma client
pnpm db:push        # push schema without a migration (dev only)
```

The schema uses plain scalars throughout — no enums, `Json`, `Bytes`, `Decimal`,
or native `@db.` annotations.

`scripts/migrate-sqlite-to-postgres.mjs` is the one-off importer used to move off
the original SQLite database. It is kept for reference and should not need to run
again.

## Deployment

Pushes to `main` deploy automatically. To deploy by hand:

```bash
vercel login
bash scripts/deploy-vercel.sh
```

That script links the project, uploads the production environment variables from
`.env.vercel-import`, and deploys. Values are piped on stdin rather than passed
as arguments so they never appear in `argv`.

The Vercel project's framework preset must stay **Next.js**. If the CLI is
allowed to auto-detect, it sees `backend/` and guesses `Services`, then writes a
multi-service block into `vercel.json` and the deploy fails looking for
`services/backend/config.json`.

## Security

```bash
node scripts/audit-weak-passwords.mjs    # read-only report
node scripts/rotate-weak-passwords.mjs   # replace defaults with random values
```

The seed scripts create accounts with hardcoded passwords. Run the audit after
seeding, and rotate before exposing an environment publicly.

## Known issues

`next.config.mjs` sets `typescript.ignoreBuildErrors: true`. There are currently
7 type errors, so removing that flag breaks the build until they are fixed:

- `auth.ts:55` — `unknown` not assignable to `"customer" | "staff" | undefined`
- `hooks/use-toast.ts:6` — imports `@/components/ui/toast`, which does not exist
- `hooks/use-toast.ts:158` — implicit `any`
- `apps/mobile/src/screens/LoginScreen.tsx:13` — `staff` missing on `{}`
- `apps/mobile/src/components/CaseStatusChart.tsx:30` — implicit `any`
