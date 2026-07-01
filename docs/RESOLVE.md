# ELLevate — Roadmap (what to build next)

This doc turns review feedback into a **phased plan**. Each phase starts with a literal “what this means for camp” section, then technical notes.

Related: [CONSTRAINTS.md](CONSTRAINTS.md) · [ANALYTICS.md](ANALYTICS.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Phase 1 — Session resilience ✅ (implemented)

> **[RESOLVED]** The prior `sessionStorage` volatility constraint (session lost
> on tab close) is fixed. Camper state now lives in `localStorage` with a
> **12-hour TTL** — see [CONSTRAINTS.md](CONSTRAINTS.md#browser-session-localstorage-12-hour-ttl--resolved).

### What this means for camp

- If a camper **refreshes the page** or **closes the tab by mistake**, they keep their name, unlocked weeks, and progress — for up to **12 hours**.
- On a **shared tablet**, a counselor taps **“New camper (reset this device)”** on the menu before the next child starts.
- Progress still does **not** move to a different device automatically (that is Phase 4 deferred work).

### What we changed

| Piece | Location |
|-------|----------|
| localStorage + 12h TTL | `src/lib/session-store.ts` |
| Central storage keys | `src/lib/camp-session-keys.ts` |
| Camper read/write | `src/lib/camper-session.ts` → `clearCampSession()` |
| Week unlock keys | `src/lib/curriculum-engine.ts` |
| Reset button | `src/app/menu/page.tsx` |

---

## Phase 2 — Telemetry hardening ✅ (implemented)

> **[RESOLVED]** Telemetry writes now flow through a **Supabase Edge Function**
> (`camper-telemetry`) instead of a direct client INSERT. The browser can no
> longer write to the database at all.

### What this means for camp

Nothing changes for campers — you still get one row per passed week. Under the
hood, a **middleman Edge Function** now sits between the app and the database:
the app sends the summary to the function, the function checks it and writes it
using a secret server-side key. This closes the direct-write path that a script
could otherwise abuse.

### What we changed

| Piece | Location |
|-------|----------|
| Write proxy (validate + service-role insert) | `supabase/functions/camper-telemetry/index.ts` |
| Client `fetch` POST helper | `src/lib/telemetry.ts` |
| Revoke direct anon/authenticated INSERT | `supabase/migrations/008_telemetry_edge_write_proxy.sql` |

### Still optional (when needed)

- Add **rate limiting** (by IP) inside `camper-telemetry` if you see abusive volume.

---

## Phase 3 — Organizer analytics UI ✅ (implemented)

### What this means for camp

Counselors open **`/admin`** on a laptop (not linked from the kid-facing app), enter an **organizer password**, and see:

- How many weeks were passed
- Which camp groups are active
- A table of each logged session
- **Export CSV** for Excel

Campers never need this page. Data still comes from the same `camper_telemetry` table — this is a friendlier window than raw Supabase SQL.

### What we changed

| Piece | Location |
|-------|----------|
| Password-protected read API | `supabase/functions/organizer-telemetry/` |
| Admin page | `src/app/admin/page.tsx` |
| Client fetch + CSV export | `src/lib/organizer-api.ts` |

### One-time setup (you do this in Supabase)

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli) (or use Dashboard → Edge Functions).
2. Set secret **`ORGANIZER_PASSWORD`** (pick a strong camp-only password).
3. Deploy: `supabase functions deploy organizer-telemetry --no-verify-jwt`
4. Open `https://your-site.pages.dev/admin` and sign in with that password.

Details: [ANALYTICS.md](ANALYTICS.md#option-b-admin-page-recommended-for-counselors) and [PUBLISH.md](PUBLISH.md#organizer-edge-function-phase-3).

---

## Phase 4 — Cross-device resume (deferred)

### What this means for camp

Camper enters a **short code** (or scans QR) at intake; progress loads from Supabase on any camp iPad.

### Why deferred

- Needs secure identity design (COPPA, no full names in URLs).
- More backend than Phase 1 localStorage.
- Shared tablets are handled by **reset + intake** for v1.

---

## Phase 5 — Remote curriculum (deferred)

### What this means for camp

Teachers change lesson text **without** redeploying the whole site — content lives in Supabase or a CMS.

### Why deferred

- Curriculum is stable for one summer; git + deploy is acceptable for v1.
- Requires caching, fallbacks, and editor workflow.

---

## Phase 6 — Game modes & cleanup ✅ (pruned)

| Item | Status |
|------|--------|
| `MatchBlitz` / `RapidFire` | **Removed** — unwired components deleted (with the orphaned `swapy` dependency). `match_blitz` / `rapid_fire` scoring stays in `lib/gamification.ts` if re-wired later. |
| `certified-angels-site/` | **Removed** — legacy static HTML/CSS deleted; nothing referenced it. |
| Teacher overrides | Out of scope until remote curriculum exists |

---

## Decision log (revolutionary choices already made)

| Choice | Literal effect | Alternative we skipped |
|--------|----------------|------------------------|
| Static export | Fast, free hosting; no server to maintain | Full Next.js server on Vercel/Node |
| End-of-session telemetry | One row when they **pass** a week | Row on every question (4× noise) |
| COPPA-minimized names | First name + last **initial** only in DB | Full legal name |
| localStorage v1 | Same iPad keeps progress 12h | Camper codes + cloud sync (Phase 4) |

---

## Glossary

See [CONSTRAINTS.md#glossary-java-terms--web-terms](CONSTRAINTS.md#glossary-java-terms--web-terms).
