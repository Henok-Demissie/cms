#!/usr/bin/env bash
# Deploy the Next.js app to Vercel as project "cms-eth" -> https://cms-eth.vercel.app
#
# Requires an authenticated Vercel CLI first:
#     vercel login
#
# Reads secrets from .env.vercel-import (gitignored — never committed). Values are
# piped to `vercel env add` on stdin so they are not exposed in argv, where any
# other process on the machine could read them from /proc.
#
# Safe to re-run: existing env vars are removed before being re-added, and Vercel
# treats a repeat `deploy --prod` as a new production deployment.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="cms-eth"
ENV_FILE=".env.vercel-import"

if ! vercel whoami >/dev/null 2>&1; then
  echo "ERROR: not logged in. Run 'vercel login' first." >&2
  exit 1
fi
echo "==> authenticated as: $(vercel whoami 2>/dev/null | tail -1)"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found." >&2
  exit 1
fi

echo "==> linking project '$PROJECT'"
vercel link --yes --project "$PROJECT"

echo "==> setting production environment variables"
while IFS= read -r line; do
  case "$line" in ''|\#*) continue ;; esac
  key=${line%%=*}
  value=${line#*=}
  # Strip one layer of surrounding quotes; Vercel stores the literal value.
  value=$(printf '%s' "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  # Remove first so re-runs update rather than fail on a duplicate key.
  vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$key" production >/dev/null
  echo "    set $key (${#value} chars)"
done < "$ENV_FILE"

echo "==> deploying to production"
vercel deploy --prod
