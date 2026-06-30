# ELLevate — Roadmap (what to build next)

This doc turns review feedback into a **phased plan**. Each phase starts with a literal “what this means for camp” section, then technical notes.

Related: [CONSTRAINTS.md](CONSTRAINTS.md) · [ANALYTICS.md](ANALYTICS.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Phase 1 — Session resilience ✅ (implemented)

### What this means for camp

- If a camper **refreshes the page** or **closes the tab by mistake**, they keep their name, unlocked weeks, and progress — for up to **12 hours**.
- On a **shared tablet**, a counselor taps **“New camper (reset this device)”** on the menu before the next child starts.
- Progress still does **not** move to a different device automatically (that is Phase 3 optional work).

### What we changed

| Piece | Location |
|-------|----------|
| localStorage + 12h TTL | `src/lib/session-store.ts` |
| Central storage keys | `src/lib/camp-session-keys.ts` |
| Camper read/write | `src/lib/camper-session.ts` → `clearCampSession()` |
| Week unlock keys | `src/lib/curriculum-engine.ts` |
| Reset button | `src/app/menu/page.tsx` |

---

## Phase 2 — Telemetry hardening (optional)

### What this means for camp

You already get **one row per passed week** in Supabase (see [ANALYTICS.md](ANALYTICS.md)). Phase 2 only matters if:

- You see **suspicious volume** of rows (spam), or
- You want to **hide** the Supabase URL from casual inspection.

### What we would build

- A thin **Cloudflare Worker** or **Supabase Edge Function** that accepts POSTs from the app, validates payload, rate-limits by IP, then inserts with a **service role** key (never shipped to browsers).

**Do not start Phase 2** until you have evidence of abuse or a compliance requirement. RLS in migration `006` is the primary control today.

---

## Phase 3 — Organizer analytics UI (optional)

### What this means for camp

Today you analyze campers in the **Supabase dashboard** and SQL Editor — no extra app to deploy. Phase 3 would add a **password-protected admin page** (e.g. `/admin`) with charts: pass rates by week, group, language, etc.

### What we would build

- Next.js route **without** static export (or a separate small admin app).
- Supabase **service role** or authenticated role with SELECT on `camper_telemetry`.
- Simple tables/charts; export to CSV for Excel.

**Priority:** Low unless counselors refuse to use Supabase directly. [ANALYTICS.md](ANALYTICS.md) covers the v1 workflow.

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

## Phase 6 — Game modes & cleanup (deferred)

| Item | Action when prioritized |
|------|-------------------------|
| `MatchBlitz` / `RapidFire` | Wire into `LessonCanvas` prompt routing **or** remove unused components |
| `certified-angels-site/` | Delete from repo after confirming nothing links to it |
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
