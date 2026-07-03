# ELLevate — Bug scan & resolve plan

**Last scanned:** July 2026  
**Scope:** Camper flow, gamification, resume codes, admin dashboard, Edge Functions, live camp wall  
**Build status at scan:** `npm run lint` and `npm run build` pass; no automated tests in repo

Related: [RESOLVE.md](RESOLVE.md) (shipped roadmap) · [REVIEW.md](REVIEW.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [CONSTRAINTS.md](CONSTRAINTS.md)

---

## How to use this doc

| Column | Meaning |
|--------|---------|
| **Status** | `Open` = not fixed · `In progress` = branch/WIP · `Resolved` = merged & verified |
| **Severity** | Critical → High → Medium → Low |
| **Phases** | Nested implementation steps for that bug |

Update status and add a **Resolved** note (PR/commit + verify steps) when each item ships.

---

## Summary

| Severity | Open | Resolved |
|----------|------|----------|
| Critical | 0 | 1 |
| High | 0 | 6 |
| Medium | 0 | 11 |
| Low | 0 | 1 |

**Suggested fix order:** Session/privacy (A) → Scoring & badges (B) → Admin accuracy (D) → Edge security (E, F) → i18n & polish (C, G)

---

## Epic A — Session, privacy & reset

### A1 — 12-hour TTL does not delete camper data

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Critical |
| **Symptom** | Privacy copy promises data expires after 12 hours; profile and progress remain in `localStorage` indefinitely. |
| **Root cause** | On expiry, `getCampSessionItem()` calls `clearCampSessionStorage()` with no keys — only `elle_session_started_at` is removed. Next read sees no clock, so expiry is false and stale data returns. |
| **Files** | `src/lib/session-store.ts`, `src/lib/camper-session.ts`, `src/lib/camp-session-keys.ts`, `src/components/IntakeGatekeeper.tsx` |

**What this means for camp:** A camper who returns after “12 hours” may still see another child’s name and progress on a shared tablet, contradicting what counselors tell families.

| Phase | Plan |
|-------|------|
| A1.1 | Audit all browser keys: camp session, week flags, telemetry queue, resume cache, legacy keys. |
| A1.2 | Add `clearAllCamperLocalData()` that clears `allCampSessionKeys()` + non-session keys. |
| A1.3 | On expiry, call full clear; ensure subsequent reads return null and intake redirect works. |
| A1.4 | Verify no “revive” path: expired → clear → refresh still empty. |

**Acceptance:** After TTL (or mocked TTL), no camper keys remain; intake is the only path forward.

---

### A2 — Telemetry queue survives “New camper” reset

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Prior camper’s queued telemetry can POST after device reset. |
| **Root cause** | `clearCampSession()` clears camp keys only; `elle_telemetry_queue_v1` is separate (`telemetry-queue.ts`). |
| **Files** | `src/lib/telemetry-queue.ts`, `src/lib/camper-session.ts` |

**What this means for camp:** Organizer data could attribute a pass to the wrong camper on a shared iPad.

| Phase | Plan |
|-------|------|
| A2.1 | Export `clearTelemetryQueue()`. |
| A2.2 | Call from `clearCampSession()` and A1 full clear. |
| A2.3 | Reset device → new intake → queue empty; flush uses new camper only. |

**Acceptance:** Reset clears queue; no cross-camper telemetry flush.

**Depends on:** A1 (shared clear helper)

---

## Epic B — Gamification & scoring

### B1 — `first_pass` badge wiped on menu load / resume

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | “First pass” disappears when returning to menu or after resume restore. |
| **Root cause** | `reconcileAchievementsWithProgress()` rebuilds from progress-only rules; preserves `perfect_week` and `speed_star` but not `first_pass`. Pass-only badges need a pass context — `evaluateAchievements(null, …)` never grants `first_pass`. |
| **Files** | `src/lib/achievements.ts`, `src/app/menu/page.tsx`, `src/lib/camper-resume.ts` |

**What this means for camp:** Campers earn a badge on the scoreboard, then it vanishes on the menu — looks broken.

| Phase | Plan |
|-------|------|
| B1.1 | Tag badges: pass-only vs progress-only. |
| B1.2 | Preserve pass-only badges in reconcile **or** derive `first_pass` when `weeksPassed >= 1`. |
| B1.3 | Update menu + restore call sites. |
| B1.4 | Pass week 1 → menu → badge still shown; restore snapshot keeps badges. |

**Acceptance:** `first_pass` persists after menu visit and resume.

---

### B2 — Cumulative score inflated on retry and refresh

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | Failed attempt + “Try again” double-counts points; mid-session refresh can double-count. |
| **Root cause** | `addSessionScore()` runs every prompt; `handleTryAgain()` resets UI state but not stored cumulative score / `completedModes`. |
| **Files** | `src/components/LessonCanvas.tsx`, `src/lib/camper-session.ts` |

**What this means for camp:** Leaderboards and point badges reflect practice noise, not actual passes.

| Phase | Plan |
|-------|------|
| B2.1 | Choose: defer scoring until pass **or** roll back session delta on retry. |
| B2.2 | Implement in `handleModeComplete` / `handleTryAgain` / pass gate. |
| B2.3 | Optional: guard against refresh double-count. |
| B2.4 | Fail 6/10 → retry → pass 8/10: cumulative reflects one pass only. |

**Acceptance:** Retry and refresh do not inflate cumulative score or mode explorer progress.

---

## Epic C — Camper flow & i18n

### C1 — Resume / edge errors not localized

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Spanish campers see English errors from resume API. |
| **Root cause** | `camper-resume.ts` returns English strings; UI displays them raw instead of `copy.resume.errors`. |
| **Files** | `src/lib/camper-resume.ts`, `src/lib/supabase/edge-functions.ts`, `ResumeCodeModal.tsx`, `IntakeGatekeeper.tsx`, `src/lib/i18n/copy.ts` |

| Phase | Plan |
|-------|------|
| C1.1 | Map API failures to stable error codes. |
| C1.2 | Translate in UI via `useCopyForLanguage`. |
| C1.3 | Spanish intake + invalid code → Spanish message. |

---

### C2 — `/application` bypass when `lesson_complete` is stale

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Direct URL to `/application` can skip lesson video for a new week. |
| **Root cause** | Single `lesson_complete` flag not tied to active week; `startWeek()` may not clear it consistently for guards. |
| **Files** | `src/lib/camper-session.ts`, `src/app/application/page.tsx`, `src/app/menu/page.tsx`, `src/app/lesson/page.tsx` |

| Phase | Plan |
|-------|------|
| C2.1 | Store lesson complete per week (or pair flag with `currentWeek`). |
| C2.2 | Application guard: redirect if current week lesson incomplete. |
| C2.3 | Start week 2 → `/application` redirects to lesson. |

---

## Epic D — Admin dashboard

### D1 — Leaderboard computed on filtered rows

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | Week/date filters change group standings incorrectly. |
| **Root cause** | `GroupLeaderboardPanel` receives `filteredRows`; cumulative max is computed on subset. |
| **Files** | `src/app/admin/page.tsx`, `src/components/admin/GroupLeaderboardPanel.tsx` |

**What this means for camp:** Counselors filter “Week 3” and think the leaderboard is wrong.

| Phase | Plan |
|-------|------|
| D1.1 | Decision: leaderboard always uses full loaded dataset; group filter OK; week/date filters do not affect ranks. |
| D1.2 | Pass `allRows` to leaderboard panel. |
| D1.3 | Filter week → table shrinks; ranks unchanged vs unfiltered. |

---

### D2 — Silent 2,000-row cap on organizer data

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | Older passes missing from table, charts, CSV, leaderboard. |
| **Root cause** | `fetchOrganizerTelemetry(..., 2000)` hard cap, newest first, no UI warning. |
| **Files** | `src/app/admin/page.tsx`, `src/lib/organizer-api.ts`, `supabase/functions/organizer-telemetry/index.ts` |

| Phase | Plan |
|-------|------|
| D2.1 | Banner when `rows.length >= 2000`: “Showing newest 2,000 sessions.” |
| D2.2 | (Optional) Pagination or cursor “Load more”. |

---

### D3 — Date filters use UTC; UI shows Eastern

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Evening ET passes fall on wrong calendar day in From/To filters. |
| **Root cause** | `completedDateKey()` uses `iso.slice(0, 10)` (UTC). |
| **Files** | `src/lib/organizer-filters.ts`, `src/app/admin/page.tsx` |

| Phase | Plan |
|-------|------|
| D3.1 | ET date helper aligned with `America/New_York` display. |
| D3.2 | Test 11pm ET vs UTC midnight boundary. |

---

### D4 — CSV formula injection

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Crafted `first_name` like `=cmd()` can execute in Excel. |
| **Root cause** | CSV escape handles quotes only, not formula prefixes. |
| **Files** | `src/lib/organizer-api.ts` |

| Phase | Plan |
|-------|------|
| D4.1 | Prefix or escape `=`, `+`, `-`, `@`, tab at cell start. |
| D4.2 | Export test row opens safely in Excel. |

---

## Epic E — Edge Functions & telemetry

### E1 — No server duplicate pass guard

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Multiple rows per camper/week from retries, queue replay, or direct API. |
| **Root cause** | No unique constraint on `(camper_id, week_number)`; client queue dedupes locally only. |
| **Files** | New migration, `supabase/functions/camper-telemetry/index.ts`, `src/lib/telemetry-queue.ts` |

| Phase | Plan |
|-------|------|
| E1.1 | Migration: unique index or upsert policy. |
| E1.2 | Return 409 on duplicate; client handles gracefully. |

---

### E2 — Rate limits & shared-IP lockout

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Camp NAT blocked after typos; counselor PIN exhausted on success; telemetry quota burned on bad payloads. |
| **Root cause** | Shared `organizer-fail:${ip}` bucket; counselor limit counts all attempts; telemetry limit before validation; in-memory per-isolate counters. |
| **Files** | `organizer-telemetry`, `organizer-wall-session`, `counselor-reset`, `camper-telemetry`, `_shared/rate-limit.ts` |

| Phase | Plan |
|-------|------|
| E2.1 | Separate fail buckets or exempt wall session from telemetry fail counter. |
| E2.2 | Counselor PIN: increment only on failure. |
| E2.3 | Telemetry: count successful inserts toward quota (or separate failed threshold). |
| E2.4 | Document best-effort limits; optional Redis/KV later. |

---

### E3 — Resume create-token reusable within TTL

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | Stolen create token can mint multiple codes within 15 minutes. |
| **Root cause** | No single-use mark on attestation tokens. |
| **Files** | `supabase/functions/camper-resume/index.ts`, `_shared/resume-attestation.ts` |

| Phase | Plan |
|-------|------|
| E3.1 | Store used token id (DB or deny list). |
| E3.2 | Reject reuse; second call fails. |

---

### E4 — Unauthenticated telemetry injection

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | Anyone with anon key can POST valid-looking pass rows. |
| **Root cause** | Validation is syntactic only — no proof-of-play or resume attestation on write path. |
| **Files** | `supabase/functions/camper-telemetry/index.ts` |

**What this means for camp:** Fake passes pollute organizer views and camp wall.

| Phase | Plan |
|-------|------|
| E4.1 | Short-term: duplicate guard (E1) + stricter slug/name consistency checks. |
| E4.2 | Long-term: HMAC or resume attestation on telemetry POST (align with resume flow). |

**Related:** E1, F1

---

## Epic F — Live camp wall (Realtime)

### F1 — Public Realtime channel (listen / spoof)

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | High |
| **Symptom** | Channel name hidden behind password, but anon clients may subscribe/publish once known. |
| **Root cause** | No Realtime Authorization / private channel; broadcast uses public anon client pattern. |
| **Files** | `src/lib/camp-wall-realtime.ts`, `CampWallFeed.tsx`, `organizer-wall-session`, `camp-wall-broadcast.ts`, Supabase Realtime policies |

**What this means for camp:** Pass feed (names, groups, scores) can be eavesdropped or faked on the organizer wall.

| Phase | Plan |
|-------|------|
| F1.1 | Enable Supabase Realtime Authorization for project. |
| F1.2 | Private channel; server-only publish (service role in `camper-telemetry`). |
| F1.3 | Organizer client subscribes with session token from `organizer-wall-session`. |
| F1.4 | Deny anon publish/subscribe without claim. |

---

### F2 — Wall timestamp, dedupe, reconnect UX

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Low–Medium |
| **Symptom** | Wall time ≠ table time; duplicate events for same name/week; badge stuck on disconnect. |
| **Root cause** | `completed_at` set at broadcast time; weak dedupe key; incomplete Realtime status handling. |
| **Files** | `camp-wall-broadcast.ts`, `CampWallFeed.tsx` |

| Phase | Plan |
|-------|------|
| F2.1 | Pass DB `completed_at` into wall payload. |
| F2.2 | Dedupe: include `group_letter`, `last_initial`, or server event id. |
| F2.3 | Handle `CLOSED` / reconnect; reset `seenIds` on reconnect. |

**Depends on:** F1

---

## Epic G — Hygiene & tests

### G1 — `metadataBase` unset (OG / Twitter images)

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Low |
| **Symptom** | Build warns; social preview URLs default to `localhost`. |
| **Files** | `src/app/layout.tsx` |

| Phase | Plan |
|-------|------|
| G1.1 | Set `metadataBase` to production URL (`https://ellevate.pages.dev`). |

---

### G2 — Regression tests for fixed bugs

| | |
|---|---|
| **Status** | **Resolved** |
| **Severity** | Medium |
| **Symptom** | No automated tests; bugs can regress silently. |
| **Files** | New `*.test.ts`, `package.json`, CI |

| Phase | Plan |
|-------|------|
| G2.1 | Add Vitest (or project-standard runner). |
| G2.2 | Tests: achievements reconcile, ET date filter, CSV escape, session clear. |
| G2.3 | CI: `npm test` on PR. |

**Depends on:** A1, B1, D3, D4 (test what was fixed)

---

## Recently resolved (outside this backlog)

These were fixed before or during the July 2026 camp wall / curriculum work. Logged here so the scan context is clear.

| Item | Resolution |
|------|------------|
| Live camp wall “Failed to fetch” | Deployed `organizer-wall-session`; fixed `secure-compare.ts` on Deno Edge; set `CAMP_WALL_CHANNEL` secret. |
| Resume code “Could not reach camp servers” | Deployed `camper-resume`; set `RESUME_ATTESTATION_SECRET`. |
| Remote curriculum panel errors | **Removed** remote curriculum feature; bundled catalog only (`3252f0f`). Update [RESOLVE.md](RESOLVE.md) Phase 5 when docs are refreshed. |

### Sprint 1–2 cleanup (local, pending commit)

| ID | Fix |
|----|-----|
| A1 | `clearAllCamperDeviceStorage()` on 12h TTL — clears all camp keys + telemetry queue |
| A2 | `clearCampSession()` uses same full clear |
| B1 | `first_pass` derived from `weeksPassed >= 1`; pass badges preserved on reconcile |
| B2 | Cumulative score applied only on pass via `applyPassedSessionScore()` |
| D1 | Leaderboard uses `allRows` (group filter only) |
| D2 | Banner when loaded rows ≥ 2,000 |
| D3 | Date filters use `America/New_York` calendar days |
| D4 | CSV cells escaped against formula injection |

---

## Sprint schedule (recommended)

```text
Sprint 1 — Camper trust     A1 → A2 → B1 → B2
Sprint 2 — Admin accuracy   D1 → D2 → D3 → D4
Sprint 3 — Security         E1 → F1 → E2 → E3 → E4
Sprint 4 — Polish           C1 → C2 → F2 → G1 → G2
```

---

## Master checklist

| ID | Task | Severity | Status | Depends |
|----|------|----------|--------|---------|
| A1 | Session expiry full clear | Critical | **Resolved** | — |
| A2 | Telemetry queue on reset | Medium | **Resolved** | A1 |
| B1 | `first_pass` reconcile | High | **Resolved** | — |
| B2 | Score on retry | High | **Resolved** | — |
| C1 | Resume i18n errors | Medium | **Resolved** | — |
| C2 | Lesson gate per week | Medium | **Resolved** | — |
| D1 | Leaderboard uses `allRows` | High | **Resolved** | — |
| D2 | 2k cap warning | High | **Resolved** | — |
| D3 | ET date filters | Medium | **Resolved** | — |
| D4 | CSV injection guard | Medium | **Resolved** | — |
| E1 | Duplicate pass guard | Medium | **Resolved** | — |
| E2 | Rate limit tuning | Medium | **Resolved** | — |
| E3 | Resume token single-use | Medium | **Resolved** | — |
| E4 | Telemetry auth hardening | High | **Resolved** | E1 |
| F1 | Realtime authorization | High | **Resolved** | — |
| F2 | Wall payload / dedupe | Low | **Resolved** | F1 |
| G1 | metadataBase | Low | **Resolved** | — |
| G2 | Regression tests | Medium | **Resolved** | A1, B1, D3, D4 |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Reconcile** | `reconcileAchievementsWithProgress()` — rebuilds badge list from progress on menu load |
| **TTL** | 12-hour session clock in `session-store.ts` |
| **Camp wall** | Organizer Realtime feed of sanitized week passes (no camper IDs) |
| **Edge Function** | Supabase serverless handler; holds secrets, validates writes |
