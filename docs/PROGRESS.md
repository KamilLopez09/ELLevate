# ELLevate — Progression Log

Chronological record of how the project was built and deployed. Newest entries at the top.

---

## Milestone 13 — Batch A security quick wins

From [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) / [REVIEW.md](REVIEW.md):

- **`009_lock_camper_intake.sql`:** Revokes anon/authenticated INSERT on unused `camper_intake` table.
- **`camper-telemetry`:** Rejects telemetry when `correct_first_try` or `score` is below pass threshold (8); requires `score === correct_first_try`.
- **`src/lib/constants.ts`:** Shared `PASS_THRESHOLD` and `SESSION_PROMPT_COUNT`; `LessonCanvas` imports from here.
- **Docs:** [PUBLISH.md](PUBLISH.md), [CONSTRAINTS.md](CONSTRAINTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) updated.

**Deploy:** Apply migration `009` in Supabase SQL Editor; redeploy `camper-telemetry` Edge Function.

## Milestone 12 — Documentation & main merge

- Consolidated SWE-facing docs: [ARCHITECTURE.md](ARCHITECTURE.md), updated [README.md](../README.md), [PUBLISH.md](PUBLISH.md), [DESIGN.md](DESIGN.md).
- Merged `cursor/cursor-ai-stack-integration-6950` into `main`: AI dev tooling (MCP, agent skills, shadcn) + UI/a11y phases.
- Verified static export build on merged `main`.

## Milestone 11 — UI/a11y hardening (5 phases)

Cross-cutting accessibility and polish for campers ages 5–14 on touch devices.

- **Phase 1 — Motion & touch:** `MotionProvider` (`reducedMotion="user"`), `prefers-reduced-motion` in `globals.css` and `animations.css`, `touch-action: manipulation`, skip link, `theme-color`, removed duplicate Google Fonts `@import`.
- **Phase 2 — Mobile nav:** `CampScreenLayout` drawer — fixed `aria-controls`, focus trap, Escape close, focus restore, `overscroll-contain`.
- **Phase 3 — Intake form:** Touch targets on controls; `focus-visible` rings; `name`/`autocomplete`; focus-first-error; persistent `aria-live` errors; type guards for `AgeBracket` / `NativeLanguage`.
- **Phase 4 — Pages:** `CampLoading` skeletons; application `<h1>`; lesson Menu as `Link`; iframe 4s failsafe; `tabular-nums` on Scoreboard; menu status pill sizing fix.
- **Phase 5 — Shared UI:** WAI-ARIA Tabs (roving tabindex, arrow keys); Button 44px sizes; RapidFire palette token fix.

Verified with Chrome DevTools MCP at 375px / 768px; production build passes.

## Milestone 10 — Cursor AI development stack

Optional contributor tooling (does not affect production runtime).

- `.cursor/mcp.json`: shadcn, Chrome DevTools, Magic (21st.dev), Supabase MCP servers.
- `.agents/skills/`: Vercel agent skills including `web-design-guidelines`.
- `components.json` + shadcn/ui init; camp tokens mapped to shadcn semantic CSS variables.
- [CURSOR_SETUP.md](CURSOR_SETUP.md) for onboarding.

## Milestone 9 — 8-week dynamic content engine

Replaced hardcoded sentence prompts with a full 8-week curriculum catalog indexed by `curriculum[week][ageBracket]`.

- **`src/data/curriculum.ts`**: immutable 8-week catalog (weeks 1–8, three age brackets each) with YouTube embed URLs, channel/title metadata, per-bracket `mode` (`drag-match` for 5–7, `click-paint` for 8–14), and `Prompt[]` arrays.
- **`src/lib/curriculum-engine.ts`**: `currentWeek` session key, `lesson_{n}_passed` unlock flags, week unlock logic (week N requires week N−1 passed), and bracket content lookup.
- **`/menu`**: dynamic 8-week grid from curriculum; selecting a week sets `currentWeek`, clears `lesson_complete`, and routes to `/lesson`.
- **`/lesson`**: reads age bracket + current week, embeds the matching YouTube iframe, enables "Ready to Practice" after iframe load (sets `lesson_complete`).
- **`/application`**: `LessonCanvas` with dynamic prompts, gamification scoring, 8/10 first-try pass gate.
- **`LessonCanvas`**: Flashcard Drill + Sentence Builder; Supabase INSERT on pass.

## Milestone 8 — Lesson-select menu hub

Added a `/menu` hub: `/` (Intake) → `/menu` → `/lesson` → `/application`.

- Week unlock badges; guards back to `/` if no session.
- Navigation rewired from single-lesson flow to multi-week camp progression.

## Milestone 7 — Game modes, Swapy drag & match, 80% accuracy gate

Expanded practice into interactive modes (precursor to current gamification engine).

- Game Mode Selector, Swapy drag-and-match prototype, 80% first-try gate (`lesson_1_passed`).
- End-of-session Supabase INSERT unchanged.

## Milestone 6 — Locked learning chain

Linear progression: `/` → `/lesson` → `/application`.

- `IntakeGatekeeper`, `lesson_complete` guard, `Tabs` + `StepRail` primitives.
- Removed obsolete `/sentence-canvas` route.

## Milestone 5 — Session-scoped identity gatekeeper

Mandatory intake before practice; telemetry attributable to camper slug + demographics.

- `camper-session.ts`, migrations `001`–`002`, COPPA-oriented field model evolved in later migrations.

## Milestone 4 — Native Cloudflare Pages

Static `out/` served from `*.pages.dev` — no Workers runtime, no OpenNext.

## Milestone 3 — Deployment pivot: Workers → Pages (PR #2)

OpenNext mismatch with `output: "export"`; pivoted to native Pages deploy.

## Milestone 2 — Build reproducibility + lint (PR #1)

Added `package-lock.json`; ESLint hook-deps cleanup.

## Milestone 1 — Initial scaffold

Next.js 15 static export, Sentence Canvas module, Supabase telemetry, Certified Angels design system.

---

See [DESIGN.md](DESIGN.md) for architectural alternatives and [ARCHITECTURE.md](ARCHITECTURE.md) for the current system map.
