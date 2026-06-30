#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN."
  echo "Create one at https://supabase.com/dashboard/account/tokens"
  echo "Then: export SUPABASE_ACCESS_TOKEN=\"sbp_...\""
  exit 1
fi

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Missing SUPABASE_PROJECT_REF (from https://YOUR_REF.supabase.co)."
  echo "Then: export SUPABASE_PROJECT_REF=\"your-ref\""
  exit 1
fi

if [[ -z "${ORGANIZER_PASSWORD:-}" ]]; then
  echo "Missing ORGANIZER_PASSWORD (camp-only password for /admin sign-in)."
  echo "Then: export ORGANIZER_PASSWORD=\"your-strong-password\""
  exit 1
fi

npx supabase link --project-ref "$SUPABASE_PROJECT_REF" --yes
npx supabase secrets set "ORGANIZER_PASSWORD=$ORGANIZER_PASSWORD"
npx supabase functions deploy organizer-telemetry --no-verify-jwt

echo ""
echo "Done. Open https://YOUR-SITE/admin and sign in with ORGANIZER_PASSWORD."
