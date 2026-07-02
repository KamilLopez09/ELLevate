# ELLevate Codebase Review: Security & UI/UX

**Date:** July 2026  
**Scope:** Full codebase audit — vulnerabilities, UX gaps, and expansion opportunities.

ELLevate is a **static-export Next.js 15** ESL camp app (React 19, Tailwind, Framer Motion) deployed to Cloudflare Pages, with Supabase Edge Functions for telemetry. There is no app server, no middleware, and no traditional auth — which shapes both the security model and UX constraints.

---

## Executive summary

**Security posture is reasonable for a small camp deployment**, with thoughtful COPPA minimization and a validated Edge Function write proxy. The main gaps are **unauthenticated telemetry spam**, **client-only progress enforcement**, and an **orphan `camper_intake` table** still open to direct anon INSERT.

**UI/UX is polished for a camp tablet flow** — strong touch targets, accessibility patterns, and a cohesive “camp canvas” design system. The biggest expansion opportunities are **unfinished game modes**, **no Spanish UI despite collecting language**, **weak video engagement gating**, and **limited organizer analytics**.

---

## Security findings

### Critical / High

| # | Issue | Risk | Location |
|---|-------|------|----------|
| 1 | **Telemetry endpoint accepts unauthenticated writes** | Anyone with the public anon key can flood `camper_telemetry` with valid-looking rows. No rate limiting, no proof-of-pass. | `supabase/functions/camper-telemetry/index.ts` |
| 2 | **Orphan `camper_intake` table allows direct anon INSERT** | Migration 007 grants anon INSERT on `camper_intake`, but the app never uses it. Migration 008 only locked down `camper_telemetry`. Attackers could spam a table you may not be monitoring. | `supabase/migrations/007_coppa_compliance_schema.sql` |
| 3 | **Organizer auth is a shared password with no rate limiting** | Brute-force attempts against `organizer-telemetry` are unconstrained. Password stored in **plaintext** in `sessionStorage`. | `organizer-telemetry/index.ts`, `src/lib/organizer-api.ts` |

### Medium

| # | Issue | Details |
|---|-------|---------|
| 4 | **Client-only route guards** | Week unlock, lesson completion, and pass threshold are enforced in `localStorage` only. A determined user can edit storage or POST fake telemetry directly. Acceptable for camp honor system; not suitable for high-stakes assessment. |
| 5 | **Telemetry integrity not verified server-side** | Edge Function validates field *ranges* but not that `correct_first_try >= 8` actually occurred. Fake passes can be logged. |
| 6 | **`/admin` is a public static page** | Security relies on password + API gate + obscurity (`robots: noindex`). No IP allowlist or second factor. |
| 7 | **CORS `Access-Control-Allow-Origin: *`** | Enables cross-origin scripted calls to both Edge Functions. Expected for a static SPA, but widens abuse surface. |
| 8 | **`verify_jwt = false` on Edge Functions** | Functions don't validate caller identity beyond payload shape (camper) or password header (organizer). |

### Low / Informational

| # | Issue | Details |
|---|-------|---------|
| 9 | **No CSP headers** | Static site on Cloudflare; no Content-Security-Policy configured in repo. YouTube embeds and Supabase fetches would need allowance. |
| 10 | **PII in localStorage** | First name, last initial, age bracket stored client-side (12h TTL). Documented and COPPA-minimized, but visible on shared devices until reset. |
| 11 | **No dependency audit in CI** | `package.json` has a small, modern dependency set; no automated `npm audit` visible in scripts. |

### What's done well

- **No hardcoded secrets** in application source
- **No XSS vectors** — no `dangerouslySetInnerHTML`, `eval`, or raw `.innerHTML`
- **Service role key** stays server-side in Edge Functions
- **Column whitelist** prevents mass-assignment in telemetry inserts
- **RLS deny-all** on `camper_telemetry` for anon/authenticated (migration 008)
- **COPPA-aware fields** — first name + last initial only, no email/DOB
- **Input validation** mirrors DB constraints in the Edge Function

---

## Recommended security fixes (prioritized)

### 1. Revoke anon INSERT on `camper_intake`

The table exists in the schema but the app never writes to it. Lock it down (or drop the table if unused):

```sql
-- New migration: lock down unused intake table
revoke insert on public.camper_intake from anon, authenticated;

create policy "deny_insert_camper_intake"
  on public.camper_intake
  as restrictive
  for insert
  to anon, authenticated
  with check (false);
```

### 2. Add rate limiting to `camper-telemetry`

IP-based throttling (e.g., 10 writes/hour/IP) via Supabase Edge Function middleware or Cloudflare WAF rules. See also [CONSTRAINTS.md](CONSTRAINTS.md) “Spam risk”.

### 3. Enforce pass integrity server-side

Reject rows where `correct_first_try < 8` (matches `PASS_THRESHOLD` in `LessonCanvas.tsx`):

```typescript
if (b.correct_first_try < 8) {
  return { ok: false, error: "Pass threshold not met" };
}
```

### 4. Organizer hardening

- Rate-limit failed password attempts
- Use `crypto.timingSafeEqual` for password comparison
- Avoid persisting password in `sessionStorage` (prompt each session or use short-lived token)

### 5. Cloudflare Access or IP allowlist for `/admin`

If organizers connect from known camp networks, restrict access at the CDN layer.

---

## UI/UX assessment

### Strengths (keep these)

| Area | Implementation |
|------|----------------|
| **Design system** | Cohesive camp palette (`globals.css`), bento grid, polaroid tilts, fluid type scale |
| **Touch-first** | 56–64px minimum targets throughout intake, lesson, and practice flows |
| **Accessibility** | Skip link, focus traps in mobile drawer, `aria-live` errors, `prefers-reduced-motion`, WAI-ARIA tabs |
| **Camp tablet flow** | 12h localStorage TTL, “New camper (reset this device)” for shared iPads |
| **Progressive disclosure** | StepRail (welcome → watch → practice), week unlock gating on menu |
| **Non-blocking telemetry** | App works offline; soft warning if Supabase unreachable |

### UX gaps & friction points

| Issue | Impact | Location |
|-------|--------|----------|
| **Video can be skipped** | “Ready to Practice” enables after iframe `onLoad` or 4s timeout — campers can bypass the lesson clip | `src/app/lesson/page.tsx` |
| **Spanish collected, UI is English-only** | `native_language` is stored but never used for copy, instructions, or error messages | Intake + all pages |
| **No celebration on pass** | Passing a week unlocks the next card but lacks a moment of delight (confetti, badge, sound) | `LessonCanvas.tsx` → menu return |
| **Locked weeks lack preview** | Locked cards show “Finish Week N-1” but not theme/teaser content | `src/app/menu/page.tsx` |
| **`window.confirm` for reset** | “New camper” uses native confirm dialog — breaks visual polish | Menu page |
| **Game modes half-built** | `GameModeSelector`, `match_blitz`, `rapid_fire` scoring exist but aren't wired into the main flow | `GameModeSelector.tsx`, `gamification.ts` |
| **No cumulative progress visible** | `cumulativeScore` tracked but not surfaced on menu or profile | `camper-session.ts` |
| **Admin is functional, not analytical** | Table + CSV export; no charts, filters, date ranges, or camper drill-down | `src/app/admin/page.tsx` |
| **Intake has no COPPA/consent copy** | Collects minor PII without visible privacy notice for counselors/parents | `IntakeGatekeeper.tsx` |

---

## UI/UX expansion & revamp opportunities

### Tier 1 — High impact, fits current architecture

| Opportunity | Description |
|-------------|-------------|
| **Pass celebration screen** | After 8/10, show animated badge + “Week X complete!” before returning to menu. Reinforces achievement for ages 5–14. |
| **Spanish UI toggle** | Use `native_language` from intake to switch labels, instructions, and error messages. Start with intake + practice prompts. |
| **Progress dashboard on menu** | Show cumulative score, weeks passed (e.g., 3/8), streak badge. Uses data already in `camperSessionData`. |
| **Wire Match Blitz / Rapid Fire** | Components and scoring exist; add mode selection after video or rotate modes per week for variety. |
| **Replace `window.confirm`** | Custom modal matching camp design for “New camper” reset — clearer for young users and counselors. |
| **Video engagement gate** | Require minimum watch time or “I've watched” acknowledgment before enabling practice button. |

### Tier 2 — Medium effort, meaningful upgrade

| Opportunity | Description |
|-------------|-------------|
| **Camper code / QR resume** | Generate a short code at intake so progress can resume on another device (requires backend session store). |
| **Organizer dashboard v2** | Charts (passes by week/group), date filter, search by name, export filtered CSV. |
| **Week preview for locked cards** | Show theme + blurred illustration on locked weeks to build anticipation. |
| **Accessibility: dynamic `lang`** | Set `<html lang="es">` when Spanish is selected; add `hreflang` if bilingual. |
| **Offline-first PWA** | Service worker for curriculum bundle; queue telemetry when offline, flush on reconnect. |
| **Counselor quick-reset PIN** | Hidden gesture or PIN to reset device without navigating menu — faster turnover on shared tablets. |

### Tier 3 — Larger revamp directions

| Direction | Vision |
|-----------|--------|
| **Gamification layer** | Achievements, avatar customization, camp leaderboard (group-scoped, COPPA-safe). |
| **Parent/counselor portal** | Read-only view of camper progress via magic link (no child PII exposure). |
| **Content CMS** | Move curriculum out of the JS bundle into Supabase or a headless CMS for in-season edits without redeploy. |
| **Real-time camp wall** | Live pass feed for organizers (Supabase Realtime on `camper_telemetry`). |
| **Multi-module camp** | Extend beyond Sentence Canvas to other Certified Angels modules with shared intake + nav. |

---

## Architecture constraint (context for both reviews)

```
┌─────────────┐     static assets      ┌──────────────────┐
│   Camper    │ ◄───────────────────── │ Cloudflare Pages │
│  (browser)  │                        │   (out/ CDN)     │
└──────┬──────┘                        └──────────────────┘
       │
       │  HTTPS POST (fetch, anon key)
       ▼
┌───────────────────────────┐   service role   ┌──────────────────┐
│  Supabase Edge Function    │ ───────────────► │     Postgres     │
│  camper-telemetry (Deno)   │   validated      │  camper_telemetry│
│  organizer-telemetry (Deno)│   INSERT/SELECT  └──────────────────┘
└───────────────────────────┘
```

Because there is **no app server**, security cannot rely on hidden logic or server-side session enforcement. The Edge Function validation layer is the correct pattern; extending it (rate limits, pass verification, intake lockdown) is the highest-ROI security work.

For full system context, see [ARCHITECTURE.md](ARCHITECTURE.md). For known limitations and spam risk, see [CONSTRAINTS.md](CONSTRAINTS.md). For organizer analytics, see [ANALYTICS.md](ANALYTICS.md).

---

## Suggested roadmap

| Phase | Security | UI/UX |
|-------|----------|-------|
| **Now** | Lock `camper_intake`, enforce pass threshold server-side, rate-limit telemetry | Pass celebration, Spanish UI for practice flow, custom reset modal |
| **Next sprint** | Organizer rate limiting, drop password from sessionStorage | Wire game modes, menu progress bar, video watch gate |
| **Later** | Cloudflare Access for `/admin`, CSP headers | Camper codes, organizer charts, PWA offline |

---

## Related docs

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, session keys, curriculum engine, telemetry flow |
| [CONSTRAINTS.md](CONSTRAINTS.md) | Static export limits, spam risk, localStorage TTL |
| [ANALYTICS.md](ANALYTICS.md) | Organizer dashboard and Supabase queries |
| [RESOLVE.md](RESOLVE.md) | How to address known constraints over time |
| [DESIGN.md](DESIGN.md) | Product and UX decision rationale |
