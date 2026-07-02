# ELLevate — Known constraints

Plain-language list of what the app **can and cannot** do today. For how to fix or improve these over time, see [RESOLVE.md](RESOLVE.md). For how camp organizers view camper results, see [ANALYTICS.md](ANALYTICS.md).

---

## In plain English

| What you might expect | What actually happens |
|----------------------|------------------------|
| Progress follows the camper to another iPad | Progress stays on **one browser/device** unless you add a login or camper code (not built yet). |
| You can see every tap in real time | The app saves **one summary row per passed week**, when the camper returns to the menu after passing. |
| Bad actors cannot spam your database | Writes go through a **Supabase Edge Function** that validates every field before inserting; the browser can no longer write to the table directly. A determined person could still send many valid-looking requests — see “Spam risk” below. |
| Change lesson text without redeploying | Curriculum lives **inside the JavaScript bundle**. Edits require a new build and deploy. |
| Match Blitz / Rapid Fire in the main flow | Only Flashcard Drill and Sentence Builder run in lessons. The old scaffolding components were removed; the scoring modes remain reserved for a future build. |

---

## Technical detail

### Static export (no app server)

The site is pre-built HTML/JS on Cloudflare Pages. There is no ELLevate backend process at runtime — only the browser and Supabase.

**Implications:**

- Supabase URL and anon key are visible in the client (normal for this pattern).
- You cannot hide table names or column shapes from someone inspecting network traffic.
- Security relies on the **Edge Function validating writes** plus **RLS policies** that deny all direct table access to the public roles — not on hiding the API. The service role key stays server-side in the Edge Function.

### Browser session (localStorage, 12-hour TTL) — **[RESOLVED]**

> **Previously:** camper identity lived in `sessionStorage`, which was wiped on
> tab close. On shared classroom iPads a child who accidentally closed the tab
> lost their name and unlocked weeks. **This volatility constraint is now
> resolved.**

Camper identity and week progress are stored in **`localStorage`** via `src/lib/session-store.ts`:

- Survives refresh and accidental tab close (unlike the old `sessionStorage`).
- **TTL logic:** `touchCampSessionClock` stamps `elle_session_started_at` at
  intake. On every read, `session-store.ts` compares `now - started_at` against a
  **12-hour** window; once exceeded, the session is treated as expired and the
  camper is returned to the start screen. This keeps a single child's progress
  resilient across an entire camp day without persisting stale identity
  overnight on a shared device.
- **“New camper (reset this device)”** on the menu wipes all keys — use on shared camp tablets between children.

Legacy `sessionStorage` keys from older builds are cleared on reset.

### Telemetry timing

| Event | Written to Supabase? |
|-------|----------------------|
| Intake submit | No (local only) |
| Video watched | No |
| Practice failed (below 8/10 first-try) | No |
| Practice **passed** + return to menu | **Yes** — one write via the `camper-telemetry` Edge Function |

If `NEXT_PUBLIC_SUPABASE_*` env vars are missing (or the Edge Function is unreachable), the app still works locally; the camper sees a non-blocking warning.

### Write path & RLS (migrations 006–009)

Telemetry writes go through the **`camper-telemetry` Edge Function**, which
validates every field (mirroring the DB constraints) and inserts with the
**service role key**. Migration `008` **revokes direct INSERT** from `anon` and
`authenticated` on `camper_telemetry`. Migration `009` **revokes direct INSERT**
on the unused `camper_intake` table (intake stays in localStorage only).

The Edge Function enforces:

- `module_name = 'sentence_canvas'`
- Valid score ranges, week 1–8, COPPA-safe name fields (`first_name`, single-letter `last_initial`)
- Allowed `game_mode`, `age_bracket`, `native_language`, `group_letter` values
- Only whitelisted columns are forwarded (no mass-assignment)
- **Pass integrity:** `correct_first_try` and `score` must be ≥ 8 and must match (failed sessions are not logged)

Organizers read data through the `organizer-telemetry` Edge Function (`/admin`)
or the **Supabase dashboard** — never through anon table access.

### Spam and abuse limits (Batch B)

Edge Functions apply **best-effort, in-memory rate limits per IP** (per Deno
isolate — sufficient for a small camp; not a global DDoS barrier). Limits key
off platform headers (`cf-connecting-ip`, `x-real-ip`) when present; treat as
soft enforcement if your deployment only exposes spoofable `x-forwarded-for`.

| Function | Limit | Response |
|----------|-------|----------|
| `camper-telemetry` | 10 POSTs / hour / IP | `429` + `Retry-After` |
| `organizer-telemetry` | 5 failed passwords / 15 min / IP | `429` then lockout |

The client still cannot INSERT into Postgres directly. A script can still send
**valid-looking passed rows** within the rate cap — monitor row volume in
[ANALYTICS.md](ANALYTICS.md).

Organizer passwords are **not stored** in `sessionStorage`; counselors re-enter
after refresh. Password compare on the server uses a constant-time digest check.

### Curriculum and content

- Source: `src/data/curriculum.ts`
- Unlock: week *N* requires passing week *N − 1* (8 of 10 first-try correct).
- Only Flashcard Drill and Sentence Builder are wired in `LessonCanvas.tsx`. The
  unused `MatchBlitz`/`RapidFire` components were removed; their `match_blitz` /
  `rapid_fire` scoring definitions remain in `lib/gamification.ts` for a future build.

---

## Glossary (Java terms → web terms)

| Web term | Plain meaning | Java-ish analogy |
|----------|---------------|------------------|
| **localStorage** | Small key/value store in the browser, shared across tabs on same site | Like a tiny persistent `Properties` file on the client |
| **Static export** | Pre-compiled files served from a CDN; no server code per request | Shipping a JAR of static resources only |
| **RLS** | Database rules that restrict what a role can read/write | Similar idea to Oracle VPD / fine-grained policies |
| **Anon key** | Public API key used only to reach the Edge Functions; no direct table access | Like a service account that can only call one stored procedure |
| **Edge Function** | Small server-side function (Deno) at the edge; holds the service role key and validates writes | Like a thin validating servlet in front of the DB |
| **Telemetry** | Summary events sent to the database for organizers | Application logging / audit inserts |
