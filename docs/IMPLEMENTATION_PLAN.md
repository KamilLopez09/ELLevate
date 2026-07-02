# ELLevate — Implementation Plan (from REVIEW.md)

Turns [REVIEW.md](REVIEW.md) into **discrete tasks**, grouped into shippable batches. Each batch follows the same loop:

```
Implement tasks → Fable 5 review → Fix findings → Update PROGRESS.md → Ship
```

Related: [RESOLVE.md](RESOLVE.md) (phases 1–6 history) · [ARCHITECTURE.md](ARCHITECTURE.md) · [CONSTRAINTS.md](CONSTRAINTS.md)

---

## Workflow per batch

### 1. Implement

- Work **one batch at a time** (do not mix security Edge Function changes with large UI refactors in the same PR unless tightly coupled).
- Mark tasks `in_progress` → `done` in the checklist below (or track in GitHub Issues using the task IDs).
- Run locally: `npm run lint` and `npm run build` before requesting review.

### 2. Fable 5 full review

After each batch is code-complete, run a **Fable 5** review pass before merge:

| Review type | When | Focus |
|-------------|------|--------|
| **Bugbot** | Every batch | Correctness, regressions, edge cases, a11y regressions |
| **Security Review** | Batches A, B, E, F | Auth, Edge Functions, migrations, PII, injection |
| **Web design guidelines** | Batches C, D, G | Touch targets, focus, motion, copy clarity |

**Review prompt template** (use in Cursor with **Claude Fable 5**):

```text
Full Repository Path: c:\Users\CHANGEME\elle-vate\ELLevate
Diff: branch changes
Change Description:
- [List each task ID completed and files touched]

Review against:
1. docs/REVIEW.md acceptance criteria for tasks [IDs]
2. docs/ARCHITECTURE.md (static export, no server actions)
3. docs/CONSTRAINTS.md (COPPA, telemetry model)
4. Camp UX: ages 5–14, shared tablets, touch-first

Return: prioritized findings (Critical/High/Medium/Low), file:line refs, and pass/fail per task ID.
```

### 3. Fix and ship

- All **Critical** and **High** findings block merge.
- Update [PROGRESS.md](PROGRESS.md) with a milestone entry when the batch ships.
- Update [CONSTRAINTS.md](CONSTRAINTS.md) if a documented limitation is resolved.

---

## Batch A — Security quick wins

**Goal:** Close the highest-ROI holes without changing camper UX.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| A1 | Lock down `camper_intake` | New migration `009_lock_camper_intake.sql` | `anon`/`authenticated` cannot INSERT; deny policy in place |
| A2 | Enforce pass threshold server-side | `supabase/functions/camper-telemetry/index.ts` | Rejects `correct_first_try < 8`; existing valid passes still insert |
| A3 | Share pass constant | `src/lib/gamification.ts` or `src/lib/constants.ts` + Edge Function | Single documented `PASS_THRESHOLD = 8`; client and server aligned |
| A4 | Document migration in PUBLISH | `docs/PUBLISH.md` | Apply order lists `009` |

**Deploy note:** After merge, run migration + redeploy `camper-telemetry`.

**Fable 5 focus:** Security Review + verify migration is idempotent.

---

## Batch B — Telemetry & organizer hardening

**Goal:** Reduce spam and brute-force risk.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| B1 | IP rate limit on `camper-telemetry` | `supabase/functions/camper-telemetry/index.ts` | e.g. max 10 POSTs/hour/IP; returns 429 when exceeded |
| B2 | Rate limit failed organizer logins | `supabase/functions/organizer-telemetry/index.ts` | e.g. max 5 failures/15 min/IP; timing-safe password compare |
| B3 | Stop persisting organizer password | `src/lib/organizer-api.ts`, `src/app/admin/page.tsx` | Password not in `sessionStorage`; re-prompt or session-only in memory |
| B4 | Update CONSTRAINTS spam section | `docs/CONSTRAINTS.md` | Documents rate limits and limits |

**Fable 5 focus:** Security Review; attempt bypass manually (rapid POST, wrong password loop).

---

## Batch C — Camper UX polish (Tier 1, part 1)

**Goal:** Delight and clarity without new backend.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| C1 | Pass celebration screen | `src/components/LessonCanvas.tsx`, new `PassCelebration.tsx` | Shows after 8/10 before menu; respects `prefers-reduced-motion` |
| C2 | Custom reset modal | `src/app/menu/page.tsx`, new `ResetCamperModal.tsx` | Replaces `window.confirm`; focus trap; clear counselor copy |
| C3 | Menu progress summary | `src/app/menu/page.tsx` | Shows weeks passed (e.g. 3/8) + cumulative score from session |
| C4 | COPPA consent blurb on intake | `src/components/sentence-canvas/IntakeGatekeeper.tsx` | Plain-language notice: what is stored, 12h TTL, reset button |

**Fable 5 focus:** Bugbot + web design guidelines; test 375px touch flow.

---

## Batch D — Spanish UI & video gate (Tier 1, part 2)

**Goal:** Use collected `native_language`; improve lesson engagement.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| D1 | i18n string map (EN/ES) | New `src/lib/i18n/` or `src/data/copy.ts` | Centralized strings for intake, menu, lesson, practice chrome |
| D2 | Wire language from session | `src/lib/camper-session.ts`, pages | UI reads `native_language`; no manual toggle needed at v1 |
| D3 | Dynamic `html lang` | `src/app/layout.tsx` or client wrapper | `lang="es"` when Spanish selected |
| D4 | Video watch gate | `src/app/lesson/page.tsx` | Minimum watch time OR explicit “I watched” before practice CTA |
| D5 | Spanish error/validation messages | Intake + `LessonCanvas` retry modal | Errors match selected language |

**Fable 5 focus:** Bugbot; verify English path unchanged; Spanish copy reviewed for reading level.

---

## Batch E — Game modes & locked-week preview

**Goal:** Wire deferred modes; improve menu anticipation.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| E1 | Re-introduce mode selection | `GameModeSelector.tsx`, lesson or application flow | Flashcard + Sentence Builder still default path; optional modes documented |
| E2 | Implement Match Blitz UI | New or restored component under `sentence-canvas/` | Uses existing `match_blitz` scoring in `gamification.ts` |
| E3 | Implement Rapid Fire UI | New or restored component | Uses `rapid_fire` scoring; touch-safe |
| E4 | Locked week preview | `src/app/menu/page.tsx` | Locked cards show theme title (blurred/desaturated); still not clickable |
| E5 | Update RESOLVE Phase 6 note | `docs/RESOLVE.md` | Reflect re-wired modes vs prior prune |

**Scope guard:** If Match Blitz / Rapid Fire exceed one sprint, ship E4 first; defer E2/E3 to Batch E2.

**Fable 5 focus:** Bugbot + gameplay edge cases (empty prompts, week boundaries).

---

## Batch F — Admin & infra (Tier 2)

**Goal:** Better organizer tools; optional CDN hardening.

| ID | Task | Files | Acceptance criteria |
|----|------|-------|---------------------|
| F1 | Organizer dashboard filters | `src/app/admin/page.tsx` | Filter by week, group, date range (client-side on fetched rows) |
| F2 | Simple charts | Admin page or `SummaryCharts.tsx` | Bar chart passes by week/group (no new deps if possible, or lightweight chart lib) |
| F3 | Filtered CSV export | `src/lib/organizer-api.ts` | Export respects active filters |
| F4 | CSP headers (Cloudflare) | `docs/PUBLISH.md` + Cloudflare config notes | Document `_headers` or dashboard CSP allowing YouTube + Supabase |
| F5 | `npm audit` in CI | GitHub Actions or documented manual step | `docs/PUBLISH.md` includes audit before release |

**Optional (camp-network only):** Cloudflare Access on `/admin` — document in PUBLISH, not code.

**Fable 5 focus:** Security Review on admin filters (no password leakage in URLs/logs).

---

## Batch G — Platform expansion (Tier 2–3, deferred)

**Do not start until Batches A–D are shipped.** These match REVIEW Tier 2–3 and RESOLVE Phase 4–5.

| ID | Task | Depends on | Notes |
|----|------|------------|-------|
| G1 | Camper code / QR resume | New Edge Function + table | RESOLVE Phase 4; COPPA design review required |
| G2 | Offline PWA + telemetry queue | Service worker | Queue passes when offline; flush on reconnect |
| G3 | Counselor quick-reset PIN | Menu/settings | Hidden gesture; not child-accessible |
| G4 | Remote curriculum CMS | Supabase content tables | RESOLVE Phase 5 |
| G5 | Real-time camp wall | Supabase Realtime | Organizer-only; read stream |
| G6 | Gamification layer | G1 optional | Achievements, group leaderboard |

Each G-batch gets its own Fable 5 review with **Security Review mandatory** (G1, G4, G5).

---

## Suggested execution order

```text
Batch A  →  Fable 5  →  deploy migration + edge
Batch B  →  Fable 5  →  deploy edge
Batch C  →  Fable 5  →  deploy static
Batch D  →  Fable 5  →  deploy static
Batch E  →  Fable 5  →  deploy static (split E2/E3 if needed)
Batch F  →  Fable 5  →  deploy static + docs
Batch G  →  design spike first, then per-feature batches
```

---

## Task checklist (living)

Copy into a GitHub Issue or track here:

### Batch A — Security quick wins
- [ ] A1 Lock `camper_intake`
- [ ] A2 Server-side pass threshold
- [ ] A3 Shared PASS_THRESHOLD constant
- [ ] A4 PUBLISH migration docs

### Batch B — Telemetry & organizer hardening
- [ ] B1 Camper telemetry rate limit
- [ ] B2 Organizer rate limit + timing-safe compare
- [ ] B3 Remove password from sessionStorage
- [ ] B4 Update CONSTRAINTS

### Batch C — Camper UX polish
- [ ] C1 Pass celebration
- [ ] C2 Custom reset modal
- [ ] C3 Menu progress summary
- [ ] C4 COPPA intake copy

### Batch D — Spanish UI & video gate
- [ ] D1 i18n string map
- [ ] D2 Wire language from session
- [ ] D3 Dynamic html lang
- [ ] D4 Video watch gate
- [ ] D5 Spanish validation messages

### Batch E — Game modes & previews
- [ ] E1 Mode selection flow
- [ ] E2 Match Blitz UI
- [ ] E3 Rapid Fire UI
- [ ] E4 Locked week preview
- [ ] E5 RESOLVE doc update

### Batch F — Admin & infra
- [ ] F1 Admin filters
- [ ] F2 Summary charts
- [ ] F3 Filtered CSV
- [ ] F4 CSP documentation
- [ ] F5 npm audit in release checklist

### Batch G — Deferred platform
- [ ] G1 Camper codes
- [ ] G2 Offline PWA
- [ ] G3 Quick-reset PIN
- [ ] G4 Remote curriculum
- [ ] G5 Real-time wall
- [ ] G6 Gamification layer

---

## Out of scope (documented, not tasks)

These REVIEW items are **accepted constraints** for v1 unless product priorities change:

| REVIEW item | Why deferred |
|-------------|--------------|
| Client-only route guards (#4) | Inherent to static export; honor system for camp |
| CORS `*` (#7) | Required for browser → Edge Function from static CDN |
| `verify_jwt = false` (#8) | Anon key is public by design; validation is in function body |
| PII in localStorage (#10) | Mitigated by 12h TTL + reset; cross-device is Batch G1 |

---

## Related docs

| Document | Purpose |
|----------|---------|
| [REVIEW.md](REVIEW.md) | Source audit findings |
| [RESOLVE.md](RESOLVE.md) | Historical phases 1–6 |
| [PROGRESS.md](PROGRESS.md) | Milestone log after each batch ships |
| [PUBLISH.md](PUBLISH.md) | Deploy steps for migrations and Edge Functions |
