# Deploy & publish

Operations guide for GitHub and Cloudflare Pages. The repository is live at [github.com/KamilLopez09/ELLevate](https://github.com/KamilLopez09/ELLevate).

---

## Prerequisites

- Node.js 20+
- GitHub access to the repository
- Cloudflare account with Pages enabled
- Supabase project with migrations applied (see [README.md](../README.md#supabase-setup))

---

## Local verification (before merge or deploy)

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_* values
npm run lint
npm run build
```

Confirm:

- `Compiled successfully`
- `Exporting (2/2)` (static export to `out/`)
- No TypeScript errors

Serve locally (optional):

```bash
npx serve out
```

---

## Git workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production — triggers Cloudflare Pages deploy |
| `cursor/*` | Feature / agent branches |

Typical flow:

```bash
git checkout main
git pull origin main
git checkout -b cursor/my-feature-6950
# … changes …
git push -u origin cursor/my-feature-6950
# Open PR → review → merge to main
```

After merge, Cloudflare rebuilds automatically if the project tracks `main`.

---

## Cloudflare Pages configuration

| Setting | Value |
|---------|-------|
| Framework preset | Next.js (Static HTML Export) or None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` (repo root) |
| Node.js version | 20 |

### Environment variables (Production + Preview)

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

Changes to `NEXT_PUBLIC_*` require a **new build** — they are inlined at compile time.

---

## Supabase migrations

Apply in the SQL Editor in numeric order:

1. `001_camper_telemetry.sql` — base table + RLS
2. `002_camper_intake_fields.sql` — identity columns
3. `003_add_gamification_stats.sql` — scoring columns
4. `004_game_mode_scoring.sql` — game mode breakdown
5. `005_age_brackets_5_9_10_14.sql` — bracket constraint update
6. `006_enforce_rls_policies.sql` — restrictive RLS hardening
7. `007_coppa_compliance_schema.sql` — COPPA intake table + PII minimization

Do not skip numbers on existing databases.

---

## Organizer Edge Function (Phase 3)

The `/admin` page reads telemetry through a Supabase Edge Function so the **service role key never ships to browsers**.

### Deploy once per Supabase project

```bash
# From repo root, with Supabase CLI logged in and project linked
supabase secrets set ORGANIZER_PASSWORD="your-strong-camp-password"
supabase functions deploy organizer-telemetry --no-verify-jwt
```

| Secret / setting | Purpose |
|------------------|---------|
| `ORGANIZER_PASSWORD` | Password counselors enter on `/admin` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase at runtime |
| `verify_jwt = false` | Function uses custom password instead of Supabase Auth |

### Verify

1. Deploy the site (includes static `/admin` page).
2. Open `https://<your-pages-url>/admin`.
3. Sign in with `ORGANIZER_PASSWORD`.
4. After a test camper pass, click **Refresh data** — row should appear.

If sign-in fails with “Organizer access is not configured”, the Edge Function secret is missing.

---

## Post-deploy smoke test

1. Open production URL (e.g. `https://ellevate.pages.dev`).
2. Complete intake form → menu → lesson → application.
3. Finish a practice session (pass or retry).
4. In Supabase Table Editor, confirm a new `camper_telemetry` row on **pass** (if env vars are set).
5. Open `/admin`, sign in with organizer password, confirm the row appears (requires Edge Function deploy).

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Build fails on Pages | Node 20; run `npm run build` locally with same env |
| Telemetry not saving | `NEXT_PUBLIC_*` set in Pages dashboard; RLS policies applied |
| Blank pages after deploy | Output directory must be `out`, not `.next` |
| Stale Supabase URL in prod | Redeploy after env var change |

---

## Legacy: initial GitHub publish

The project was originally published with `gh repo create` and a feature branch PR. That one-time bootstrap is complete — use the Git workflow above for ongoing changes.
