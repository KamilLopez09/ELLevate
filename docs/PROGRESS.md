# ELLevate — Progression Log

A chronological record of how the project was built and deployed, including the
decisions and course-corrections along the way. Newest entries at the top.

## Milestone 9 — Lesson-select menu hub

Added a `/menu` hub so the flow now reads: `/` (Intake) → `/menu` → `/lesson` → `/application` → back to `/menu`.

- New `/menu` page: greets the camper by first name and lists lessons. Lesson 1 ("Action Verbs in Motion") is always available; Lesson 2 ("Describing with Adjectives") is locked (🔒 "Finish Lesson 1 to unlock") until `lesson_1_passed` is set, then flips to an unlocked "Coming soon" state. Lesson 1 shows a "Passed ✓ · Replay" badge once cleared. Guards back to `/` if there's no session.
- Rewired navigation: intake now routes to `/menu` (was `/lesson`); the canvas "Back to Menu — Unlock Next Lesson!" button routes to `/menu` (was `/lesson`); added a "← Menu" link on the lesson page.
- Verified the full loop in-browser: intake → menu (Lesson 2 locked) → Lesson 1 → 100% pass → Back to Menu (Lesson 1 "Passed", Lesson 2 unlocked).

## Milestone 8 — Game modes, Swapy drag & match, 80% accuracy gate

Expanded the Paint step into two interactive modes plus an accuracy requirement to advance.

- **Game Mode Selector** (`GameModeSelector.tsx`): a "Choose Your Painting Style!" card shown on `/application` before the canvas, offering **Click to Paint** (purple) and **Drag & Match** (teal).
- **Drag & Match (Swapy):** added `swapy@^1.0.5`. The sentence blank is a `data-swapy-slot`; each answer is a `data-swapy-item`/`data-swapy-handle` block (56px min hit target, `role="button"` for a11y). Dropping a word in the blank fires evaluation; correct locks + advances, wrong shakes and slides back. The board remounts (via a parent `key`) between sentences and after a wrong attempt so Swapy always starts from clean DOM — avoiding React-vs-Swapy reconciliation conflicts.
- **80% accuracy gate:** tracks first-try accuracy `(correct_first_try / total) * 100`. On completion, ≥80% shows a celebratory screen, sets `lesson_1_passed: true` in `sessionStorage`, and offers "Back to Menu — Unlock Next Lesson! 🔓" (routes to `/lesson`). <80% shows an encouraging screen with "Try Again".
- Shared answer logic (`evaluateAnswer`) drives both modes; the single end-of-session Supabase INSERT is unchanged.
- Verified end-to-end in-browser: intake → lesson → mode select → drag correct/incorrect/reset → 5-sentence completion → 80% pass screen with `lesson_1_passed` set and a telemetry row written ("Session saved for camp organizers").

## Milestone 7 — Locked Learning Chain

Introduced a linear, locked progression so campers move through the lesson in order: `/` (Intake) -> `/lesson` (Video/Content) -> `/application` (Sentence Canvas).

- `/` is now the Intake step. `IntakeGatekeeper` writes the session and `router.push("/lesson")` (returning campers are redirected straight to the lesson); it no longer renders the canvas inline.
- New `/lesson` page: `shadow-bento` card with a 16:9 video embed placeholder (VOA / British Council), a custom `Tabs` component (Key Verbs / Examples / Tips), and a `purple-accent` "Ready to Paint!" button that sets `lesson_complete: true` in `sessionStorage` and routes to `/application`.
- New `/application` page: hosts `SentenceCanvas` behind a `useEffect` guard — missing `camperSessionData` redirects to `/`, missing `lesson_complete` redirects to `/lesson`. The lesson page also guards back to `/` if intake was skipped.
- Raw UI primitives added under `src/components/ui/`: `Tabs` (teal-accent labels, 56px targets, no external lib) and `StepRail` (the 1·2·3 chain indicator shown on each step).
- `lesson_complete` helpers (`setLessonComplete` / `isLessonComplete`) centralized in `lib/camper-session.ts`; all progression state stays in `sessionStorage`.
- Removed the obsolete `/sentence-canvas` route. Supabase telemetry in `SentenceCanvas` is unchanged.

## Milestone 6 — Certified Angels branding + UX refinement

- Added a `camp-blue` (`#C3E3F0`) color token (Tailwind + CSS var) and set it as the primary page/body background.
- Content/canvas cards converted to solid `paper` (`#FAF7F2`) for clean, high-contrast separation against the blue (replacing the earlier translucent white).
- Both routes (`/` and `/sentence-canvas`) use `bg-camp-blue`; decorative blobs keep their opacity/blur and complement the blue.
- Tactile feedback: hover + tap scaling on swatches, the completion button, the intake submit, and nav pills ("primal gesture" response).
- Joyful success cue: a celebratory green flash sweeps the sentence card on a correct answer (layered behind the text), alongside the existing spring fill and shake-on-error.
- Touch targets standardized to a 56px minimum across intake inputs/selects and buttons (swatches were already 56px).
- Structural cleanup verified: no OpenNext/Wrangler artifacts remain; `next.config.ts` stays `output: "export"`.
- Confirmed the full intake -> telemetry pipeline writes attributable rows (verified a live row: `Kamil L` / `kamil-l`, age `11-14`, group `B`).

## Milestone 5 — Session-Scoped Identity Gatekeeper

Added a mandatory intake step before the Sentence Canvas so telemetry is
attributable to a camper.

- New `IntakeGatekeeper.tsx`: checks `sessionStorage` for `camperSessionData`; if absent, shows a kid-friendly form (First Name + Last Initial, Age Bracket `5-7`/`8-10`/`11-14`, Home Language `English`/`Spanish`, Camp Group letter `A`-`Z`). On submit it persists the data and Framer Motion transitions to the canvas.
- New `lib/camper-session.ts`: shared storage key, accent-aware `slugify` (`"Maria G"` -> `maria-g`), and hydration-safe read/write helpers.
- `SentenceCanvas.tsx`: the single end-of-session INSERT now includes the analyst-facing identifiers `camper_id`, `display_name` (name PII), `age_bracket`, `native_language`, and `group_letter`. If intake was bypassed, telemetry is skipped rather than writing an orphaned row.
- Types extended: `AgeBracket`, `NativeLanguage`, `CamperSessionData`, and five identity fields on `CamperTelemetryRow`.
- Database: `001` updated for fresh installs; `002_camper_intake_fields.sql` adds the columns idempotently (with backfill) and recreates the RLS insert policy to validate the new fields.

Note: `display_name` is personally identifiable information (camper name). It is
stored so a data analyst can identify campers; treat the table as PII-bearing
and keep the anon key INSERT-only (no SELECT for `anon`).

Apply `002_camper_intake_fields.sql` in Supabase if the table was already created.

## Milestone 4 — Native Cloudflare Pages

- Confirmed a successful **native Pages** build (`initialize → clone → build → deploy` all green) serving from `*.ellevate.pages.dev`.
- Production branch to be set to `main`; per-deployment alias (e.g. `f1a035b5.ellevate.pages.dev`) sits in front of the stable `ellevate.pages.dev`.
- Net result: static `out/` is served directly by Pages — no Workers runtime, no OpenNext, no wrangler.

### Remaining to go fully live
- Set Pages **Production branch = `main`**.
- Ensure build env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist in the Pages project.
- Run the Supabase migration (`camper_telemetry` + RLS).
- Smoke test: finish 5 sentences → expect HTTP 201 POST and one new telemetry row.

## Milestone 3 — Deployment pivot: Workers → Pages (PR #2)

Problem encountered, in order:

1. First Cloudflare attempt auto-detected Next.js and ran `bunx opennextjs-cloudflare build`, which expects `output: "standalone"`. Our app is `output: "export"`, so it failed with `ENOENT … .next/standalone/.next/server/pages-manifest.json`.
2. Switched build/deploy commands to `npm run build` / `npx wrangler deploy` and added a `wrangler.jsonc` static-assets config — a Workers static-assets path.
3. Decided to follow the stricter architectural rule: deploy **natively to Pages**, bypassing Workers and OpenNext entirely.

Changes in **PR #2** (`chore/pages-native-pivot`):
- Deleted `wrangler.jsonc` and the `.wrangler/` gitignore entry (Workers artifacts no longer needed).
- Confirmed `next.config.ts` keeps `output: "export"` + `images: { unoptimized: true }`.
- Hardened the anti-spam guard: added a synchronous `transitionLockRef` so rapid double-clicks on the final sentence cannot bypass the async `isSubmitting`/`feedback` state and double-fire telemetry. The DB insert remains additionally guarded by `finishCalledRef`.

## Milestone 2 — Build reproducibility + lint (PR #1)

Changes in **PR #1** (`chore/lockfile-and-build-fix`):
- Added `package-lock.json` for reproducible installs on Cloudflare builds.
- Removed an unnecessary `errorCount` dependency from the `handleSelect` `useCallback` to clear a `react-hooks/exhaustive-deps` warning.

## Milestone 1 — Initial scaffold

- Bootstrapped Next.js 15 (App Router, `src/`, TypeScript, Tailwind) as a static export.
- Built the **Sentence Canvas** module: click-to-fill verb conjugation with Framer Motion (spring fill on correct, horizontal shake on wrong), bilingual EN/ES prompts, progress indicator, and a celebratory completion screen.
- 5 hardcoded sample sentences in `src/data/sentence-prompts.ts` (designed to be swapped for open-source ESL corpora later).
- Supabase telemetry: browser client using only `NEXT_PUBLIC_*` keys, single end-of-session INSERT, graceful fallback when env vars are absent.
- `camper_telemetry` schema with RLS — anonymous INSERT only, no SELECT.
- Certified Angels "creative canvas" design system (paper background, purple/gold/teal accents, heavily rounded bento cards).

See [DESIGN.md](DESIGN.md) for the architectural alternatives weighed at each step,
and [PUBLISH.md](PUBLISH.md) for the GitHub + Cloudflare publish steps.
