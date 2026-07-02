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
npm audit --audit-level=high
```

Confirm:

- `Compiled successfully`
- `Exporting (2/2)` (static export to `out/`)
- No TypeScript errors
- `npm audit` reports no **high** or **critical** vulnerabilities (CI runs the same check on every PR)

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

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run lint`, `npm run build`, and `npm audit --audit-level=high` on pushes and PRs to `main`.

---

## Content Security Policy (CSP)

The repo ships `public/_headers` for Cloudflare Pages. Next.js copies it to `out/_headers` on build so Cloudflare applies headers at the edge.

| Directive | Allows |
|-----------|--------|
| `connect-src` | Same origin + your Supabase project (`https://*.supabase.co`) for telemetry |
| `frame-src` | YouTube / YouTube-nocookie embeds on `/lesson` |
| `script-src` / `style-src` | `'self'` + `'unsafe-inline'` (Next.js static chunks and Tailwind) |

To tighten CSP further, prefer nonces or hashes instead of `'unsafe-inline'` — that requires a build plugin and is optional for camp v1.

**Optional — hide `/admin` from search engines:** The `_headers` file sets `X-Robots-Tag: noindex` on `/admin`.

**Optional — camp-network only:** [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) can require staff login before `/admin` loads, in addition to the organizer password. Configure in the Cloudflare dashboard; no app code change required.

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
8. `008_telemetry_edge_write_proxy.sql` — revoke direct client INSERT (writes move to the Edge Function)
9. `009_lock_camper_intake.sql` — revoke direct INSERT on unused `camper_intake` table

Do not skip numbers on existing databases.

After applying `009`, redeploy **`camper-telemetry`** if you already deployed an older version — the function now rejects rows below the pass threshold (`correct_first_try` < 8).

---

## Edge Functions

Both database paths run as Supabase Edge Functions so the **service role key
never ships to browsers**.

- **`camper-telemetry`** — public write proxy. Validates each passed-session
  payload and inserts with the service role key. Rate limit: **10 POSTs/hour/IP**.
- **`organizer-telemetry`** — password-protected reads for `/admin`. Locks out
  an IP for 15 minutes after **5 failed password attempts** (constant-time compare).

### Deploy once per Supabase project

```bash
# From repo root, with Supabase CLI logged in and project linked.
# Convenience script deploys BOTH functions and sets the organizer secret:
npm run supabase:deploy-organizer

# ...or manually:
supabase secrets set ORGANIZER_PASSWORD="your-strong-camp-password"
supabase functions deploy camper-telemetry --no-verify-jwt
supabase functions deploy organizer-telemetry --no-verify-jwt
```

| Secret / setting | Purpose |
|------------------|---------|
| `ORGANIZER_PASSWORD` | Password counselors enter on `/admin` (organizer-telemetry only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase at runtime; used by both functions |
| `verify_jwt = false` | Functions are called with the anon key; auth is custom (password) or open write-proxy |

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
4. In Supabase Table Editor, confirm a new `camper_telemetry` row on **pass** (requires env vars **and** the `camper-telemetry` function deployed).
5. Open `/admin`, sign in with organizer password, confirm the row appears (requires the `organizer-telemetry` function deployed).

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Build fails on Pages | Node 20; run `npm run build` locally with same env |
| Telemetry not saving | `NEXT_PUBLIC_*` set in Pages dashboard; migrations through `009` applied; `camper-telemetry` Edge Function deployed (must enforce pass threshold) |
| Blank pages after deploy | Output directory must be `out`, not `.next` |
| Stale Supabase URL in prod | Redeploy after env var change |

---

## Legacy: initial GitHub publish

The project was originally published with `gh repo create` and a feature branch PR. That one-time bootstrap is complete — use the Git workflow above for ongoing changes.
