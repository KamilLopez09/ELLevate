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
       │  HTTPS POST (anon key)
       ▼
┌──────────────────┐
│     Supabase     │
│  camper_telemetry│  INSERT-only RLS
└──────────────────┘
```

There is **no application server**. All logic runs client-side; Supabase is the only remote persistence.

---

## Application routes

| Route | Component | Guard | Purpose |
|-------|-----------|-------|---------|
| `/` | `IntakeGatekeeper` | Redirect to `/menu` if session exists | Collect camper identity (sessionStorage) |
| `/menu` | Week grid (`BentoGrid`) | Requires session | Select curriculum week; shows lock/pass state |
| `/lesson` | YouTube embed + tabs | Requires session | Watch week video; sets `lesson_complete` |
| `/application` | `LessonCanvas` | Session + `lesson_complete` | 10-prompt practice session; telemetry on pass |

Navigation shell: `CampScreenLayout` (sidebar on desktop, modal drawer on mobile).

---

## Client session state (`sessionStorage`)

| Key | Writer | Reader | Value |
|-----|--------|--------|-------|
| `camperSessionData` | IntakeGatekeeper | All routes | JSON `CamperSessionData` |
| `currentWeek` | Menu | Application, curriculum engine | Week number (1–8) |
| `lesson_complete` | Lesson page | Application guard | `"true"` after video step |
| `lesson_{n}_passed` | LessonCanvas | Menu unlock logic | `"true"` when week passed |
| `selectedGameMode` | Legacy / cleared on menu | — | Deprecated path |

Session data does **not** survive tab close. No cookies or server sessions.

### Camper identity (COPPA-aware)

Stored fields: `camper_id` (slug), `first_name`, `last_initial` (single letter), `age_bracket` (`5-9` | `10-14`), `native_language`, `group_letter`, plus gamification aggregates.

Legacy age brackets (`5-7`, `8-10`, `11-14`) are migrated on read in `camper-session.ts`.

---

## Curriculum engine

- **Source:** `src/data/curriculum.ts` — 8 weeks × 3 age groups (`5-7`, `8-10`, `11-14` mapped from intake brackets).
- **Unlock rule:** Week 1 always open; week *N* requires `lesson_{N-1}_passed`.
- **Pass rule:** ≥ 8 of 10 prompts answered correctly on **first try** (`PASS_THRESHOLD` in `LessonCanvas.tsx`).
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
| `flashcard_drill` | `FlashcardDrill.tsx` | Active (review prompts) |
| `sentence_builder` | `SentenceBuilder.tsx` | Active (production prompts) |
| `match_blitz` | `MatchBlitz.tsx` | Scaffolded (post-launch) |
| `rapid_fire` | `RapidFire.tsx` | Scaffolded (post-launch) |

---

## Telemetry & Supabase

**When:** One INSERT after a **passed** session (not on retry, not per-click).

**Client:** `createBrowserClient()` in `lib/supabase/client.ts` using `NEXT_PUBLIC_*` env vars. If env is missing, session completes locally and a non-blocking warning is shown.

**Payload (`CamperTelemetryRow`):** module metadata, game scoring breakdown, week number, accuracy stats, and COPPA-minimized identity (`first_name`, `last_initial` — not full display name in current types).

**Migrations:** Apply `001`–`007` in order. Later migrations extend columns (gamification), tighten RLS (`006`), and add COPPA intake table (`007`). The checked-in `001` reflects the original schema; production databases should reflect the latest migration state.

**Security model:**

- Anon key is public (expected for static apps).
- RLS: INSERT-only for `anon`; restrictive policies deny SELECT/UPDATE/DELETE.
- No service role in the client.

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

| Item | Notes |
|------|-------|
| Static export | Cannot hide Supabase table shape from determined clients |
| Content updates | Curriculum changes require redeploy |
| Match Blitz / Rapid Fire | UI present; not wired into main lesson flow |
| `certified-angels-site/` | Legacy static HTML/CSS; not part of Next app |
| Telemetry without env | App works; INSERT skipped with user-visible notice |
