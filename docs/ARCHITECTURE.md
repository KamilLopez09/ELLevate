# ELLevate — Architecture

Technical overview for software engineering review. For decision rationale, see [DESIGN.md](DESIGN.md). For history, see [PROGRESS.md](PROGRESS.md).

---

## System context

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

There is **no application server**. All UI logic runs client-side on a static
export; the browser never opens a direct database connection. The only remote
persistence is Supabase, reached through two Deno **Edge Functions**:

- **`camper-telemetry`** — public write proxy. The client `POST`s a passed-session
  summary; the function validates it and inserts with the service role key.
- **`organizer-telemetry`** — password-protected reads for `/admin`.

---

## Application routes

| Route | Component | Guard | Purpose |
|-------|-----------|-------|---------|
| `/` | `IntakeGatekeeper` | Redirect to `/menu` if session exists | Collect camper identity (localStorage) |
| `/menu` | Week grid (`BentoGrid`) | Requires session | Select week; **New camper** resets device storage |
| `/lesson` | YouTube embed + tabs | Requires session | Watch week video; sets `lesson_complete` |
| `/application` | `LessonCanvas` | Session + `lesson_complete` | 10-prompt practice session; telemetry on pass |
| `/admin` | Organizer dashboard | Organizer password + Edge Function | Read-only camper telemetry; not linked from camper nav |

Navigation shell: `CampScreenLayout` (sidebar on desktop, modal drawer on mobile). `/admin` uses a standalone layout.

---

## Client session state (`localStorage`)

Persistence: `src/lib/session-store.ts` — **localStorage** with a **12-hour TTL** from intake. Legacy `sessionStorage` keys from older builds are cleared on reset.

| Key | Writer | Reader | Value |
|-----|--------|--------|-------|
| `elle_session_started_at` | Intake (`touchCampSessionClock`) | session-store | Timestamp for TTL expiry |
| `camperSessionData` | IntakeGatekeeper | All routes | JSON `CamperSessionData` |
| `currentWeek` | Menu | Application, curriculum engine | Week number (1–8) |
| `lesson_complete` | Lesson page | Application guard | `"true"` after video step |
| `lesson_{n}_passed` | LessonCanvas | Menu unlock logic | `"true"` when week passed |
| `selectedGameMode` | Legacy / cleared on menu | — | Deprecated path |

**Reset:** `clearCampSession()` in `camper-session.ts` wipes all keys — triggered by **New camper (reset this device)** on the menu for shared tablets.

Session data does **not** sync across devices. No cookies or server sessions.

### Camper identity (COPPA-aware)

Stored fields: `camper_id` (slug), `first_name`, `last_initial` (single letter), `age_bracket` (`5-9` | `10-14`), `native_language`, `group_letter`, plus gamification aggregates.

Legacy age brackets (`5-7`, `8-10`, `11-14`) are migrated on read in `camper-session.ts`.

---

## Curriculum engine

- **Source:** `src/data/curriculum.ts` — 8 weeks × 3 age groups (`5-7`, `8-10`, `11-14` mapped from intake brackets).
- **Unlock rule:** Week 1 always open; week *N* requires `lesson_{N-1}_passed`.
- **Pass rule:** ≥ 8 of 10 prompts answered correctly on **first try** (`PASS_THRESHOLD` in `src/lib/constants.ts`, enforced client-side and in `camper-telemetry`).
- **Prompt routing:** `category === "review"` → Flashcard Drill; otherwise → Sentence Builder.

---

## Practice session (`LessonCanvas`)

1. Loads prompts for `currentWeek` + resolved age group.
2. Runs a linear sequence of up to 10 prompts (review + builder mix).
3. Scores each completion via `lib/gamification.ts` (base, first-try bonus, speed bonus).
4. On session end:
   - **Pass:** `markWeekCompleted`, confetti UI, single Supabase INSERT.
   - **Fail:** Retry modal; no week unlock; no telemetry requirement.

### Game modes

| ID | Component | Status |
|----|-----------|--------|
| `flashcard_drill` | `FlashcardDrill.tsx` | Active (review prompts; default auto path) |
| `sentence_builder` | `SentenceBuilder.tsx` | Active (default auto path for core/generative) |
| `match_blitz` | `MatchBlitz.tsx` | Optional via `GameModeSelector` (drag-match prompts) |
| `rapid_fire` | `RapidFire.tsx` | Optional via `GameModeSelector` (click-paint prompts) |

Mode selection is optional on `/application`. With no selection, behavior matches the original v1 auto routing in `lib/game-mode-routing.ts`.

---

## Telemetry & Supabase

**When:** One write after a **passed** session (not on retry, not per-click).

**Write pipeline (edge-compute):**

```
LessonCanvas → postCamperTelemetry() → fetch POST
  → camper-telemetry Edge Function (Deno)
     → validate payload (mirrors RLS constraints)
     → INSERT via service role → Postgres camper_telemetry
```

- **Client:** `postCamperTelemetry()` in `lib/telemetry.ts` `fetch`-POSTs the
  payload to `/functions/v1/camper-telemetry`. The browser holds **only** the
  public anon key and **never** connects to the database directly. If env is
  missing or the function returns non-2xx, the session completes locally and a
  non-blocking warning is shown.
- **Edge Function:** `supabase/functions/camper-telemetry/index.ts` re-validates
  every field against the same rules as the DB check constraints, forwards only
  whitelisted columns (no mass-assignment), and inserts with the
  `SUPABASE_SERVICE_ROLE_KEY` (server-side only).

**Payload (`CamperTelemetryRow`):** module metadata, game scoring breakdown, week number, accuracy stats, and COPPA-minimized identity (`first_name`, `last_initial`).

**Migrations:** Apply `001`–`008` in order. Later migrations extend columns (gamification), tighten RLS (`006`), add the COPPA intake table (`007`), and route telemetry writes through the Edge Function by revoking direct client INSERT (`008`). Production databases should reflect the latest migration state.

**Security model:**

- Anon key is public (expected for static apps) and is used only to reach the Edge Functions through the Supabase gateway.
- RLS: `anon`/`authenticated` have **no** table privileges — restrictive policies deny SELECT/UPDATE/DELETE **and** INSERT (`008`).
- The **service role key never reaches the client**; it lives only in the Edge Function environment.
- **Writes:** client → `camper-telemetry` Edge Function (validates, inserts via service role).
- **Organizer reads:** `/admin` → `organizer-telemetry` Edge Function (service role server-side, `ORGANIZER_PASSWORD` secret).

---

## UI & accessibility

| Concern | Implementation |
|---------|----------------|
| Reduced motion | `MotionProvider` (`MotionConfig reducedMotion="user"`) + `@media (prefers-reduced-motion)` in CSS |
| Touch | `min-h-[56px]` on interactive controls; `touch-action: manipulation` in globals |
| Navigation | Skip link → `#main-content` on each route |
| Mobile nav | `CampScreenLayout` drawer: `role="dialog"`, focus trap, Escape, `overscroll-contain` |
| Forms | Intake: `autocomplete`, focus-first-error, persistent `aria-live` errors |
| Theme | CSS variables in `globals.css`; shadcn semantic tokens mapped to camp palette |

Fonts: Nunito (display) + Open Sans (body) via `next/font` — no render-blocking `@import`.

---

## Build & deploy

```bash
npm run build   # next build → static HTML/JS in out/
```

`next.config.ts`:

```typescript
output: "export"
images: { unoptimized: true }
```

Implications:

- No API routes, SSR, or middleware at runtime.
- Env vars inlined at build time for `NEXT_PUBLIC_*`.
- Rebuild required to change Supabase target or curriculum bundled in JS.

---

## Developer tooling (optional)

Cursor MCP servers and Vercel agent skills are configured for AI-assisted development. They do not affect production builds. See [CURSOR_SETUP.md](CURSOR_SETUP.md).

---

## Known constraints & follow-ups

See [CONSTRAINTS.md](CONSTRAINTS.md) and [RESOLVE.md](RESOLVE.md). Organizer analytics: [ANALYTICS.md](ANALYTICS.md).

| Item | Notes |
|------|-------|
| Static export | Cannot hide Supabase table shape from determined clients |
| Content updates | Curriculum changes require redeploy |
| Telemetry without env | App works; INSERT skipped with user-visible notice |
| Cross-device progress | Not in v1; localStorage + menu reset on shared tablets |
