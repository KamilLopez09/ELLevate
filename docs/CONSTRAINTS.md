# ELLevate — Known constraints

Plain-language list of what the app **can and cannot** do today. For how to fix or improve these over time, see [RESOLVE.md](RESOLVE.md). For how camp organizers view camper results, see [ANALYTICS.md](ANALYTICS.md).

---

## In plain English

| What you might expect | What actually happens |
|----------------------|------------------------|
| Progress follows the camper to another iPad | Progress stays on **one browser/device** unless you add a login or camper code (not built yet). |
| You can see every tap in real time | The app saves **one summary row per passed week**, when the camper returns to the menu after passing. |
| Bad actors cannot spam your database | Supabase **Row Level Security (RLS)** validates each insert; junk rows are rejected. A determined person could still send many valid-looking rows — see “Spam risk” below. |
| Change lesson text without redeploying | Curriculum lives **inside the JavaScript bundle**. Edits require a new build and deploy. |
| Match Blitz / Rapid Fire in the main flow | Those screens exist as **scaffolding**; only Flashcard Drill and Sentence Builder run in lessons today. |

---

## Technical detail

### Static export (no app server)

The site is pre-built HTML/JS on Cloudflare Pages. There is no ELLevate backend process at runtime — only the browser and Supabase.

**Implications:**

- Supabase URL and anon key are visible in the client (normal for this pattern).
- You cannot hide table names or column shapes from someone inspecting network traffic.
- Security relies on **RLS policies**, not on hiding the API.

### Browser session (localStorage, 12-hour TTL)

Camper identity and week progress are stored in **`localStorage`** via `src/lib/session-store.ts`:

- Survives refresh and accidental tab close (unlike old `sessionStorage`).
- Expires after **12 hours** from intake; then the camper is sent back to the start screen.
- **“New camper (reset this device)”** on the menu wipes all keys — use on shared camp tablets between children.

Legacy `sessionStorage` keys from older builds are cleared on reset.

### Telemetry timing

| Event | Written to Supabase? |
|-------|----------------------|
| Intake submit | No (local only) |
| Video watched | No |
| Practice failed (below 8/10 first-try) | No |
| Practice **passed** + return to menu | **Yes** — one `INSERT` into `camper_telemetry` |

If `NEXT_PUBLIC_SUPABASE_*` env vars are missing, the app still works locally; the camper sees a non-blocking warning.

### RLS mitigations (migrations 006–007)

Anonymous campers may **INSERT only**. SELECT/UPDATE/DELETE are denied for `anon`.

Insert policies enforce:

- `module_name = 'sentence_canvas'`
- Valid score ranges, week 1–8, COPPA-safe name fields (`first_name`, single-letter `last_initial`)
- Allowed `game_mode`, `age_bracket`, `native_language`, `group_letter` values

Organizers read data in the **Supabase dashboard** (service role / project owner), not through the camper app.

### Spam risk

RLS stops malformed rows but not a script sending many **policy-compliant** rows. Mitigations if this becomes a problem:

1. **Phase 2 (optional):** Cloudflare Worker or Supabase Edge Function as a write proxy with rate limits.
2. Monitor row volume in Supabase (see [ANALYTICS.md](ANALYTICS.md)).

For a small camp deployment, RLS + one-row-per-pass is usually enough.

### Curriculum and content

- Source: `src/data/curriculum.ts`
- Unlock: week *N* requires passing week *N − 1* (8 of 10 first-try correct).
- Post-launch game modes (`MatchBlitz`, `RapidFire`) are not wired in `LessonCanvas.tsx`.

### Legacy folder

`certified-angels-site/` is an old static site copy. It is **not** part of the Next.js build.

---

## Glossary (Java terms → web terms)

| Web term | Plain meaning | Java-ish analogy |
|----------|---------------|------------------|
| **localStorage** | Small key/value store in the browser, shared across tabs on same site | Like a tiny persistent `Properties` file on the client |
| **Static export** | Pre-compiled files served from a CDN; no server code per request | Shipping a JAR of static resources only |
| **RLS** | Database rules: “this role may only INSERT rows that look like X” | Similar idea to Oracle VPD / fine-grained policies |
| **Anon key** | Public API key with limited DB permissions | Like a JDBC user with INSERT-only grants |
| **Telemetry** | Summary events sent to the database for organizers | Application logging / audit inserts |
