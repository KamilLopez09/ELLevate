# ELLevate

Free, interactive ESL web application for **Certified Angels** — an arts-based youth summer camp. Campers ages 5–14 practice English and Spanish through game-like modules instead of traditional tests.

## System overview

ELLevate is a **COPPA-compliant, static-edge architecture**: there is no
application server, and the browser never opens a direct database connection.
The UI is a **static export served from the CDN edge** (Cloudflare Pages),
camper identity stays on-device in `localStorage` (12-hour TTL, COPPA-minimized
to first name + last initial), and all database access goes through two Supabase
**Edge Functions** (Deno):

- **`camper-telemetry`** — validates each passed-session summary and inserts it
  with the service role key. Direct client INSERT is revoked at the database.
- **`organizer-telemetry`** — password-protected reads for the organizer `/admin` page.

**Production:** static export on Cloudflare Pages · **Backend:** Supabase Postgres behind Deno Edge Functions (validated telemetry writes + organizer reads)

---

## Features

| Area | Description |
|------|-------------|
| **Intake** | COPPA-aware session gate (`first_name`, last initial, age bracket `5-9` / `10-14`, language, camp group) stored in **localStorage** (12-hour TTL) |
| **8-week curriculum** | Week themes, YouTube embeds, age-bracket prompts in `src/data/curriculum.ts` |
| **Lesson flow** | `/` → `/menu` → `/lesson` (video) → `/application` (practice) with week unlock progression; **New camper** reset on menu for shared tablets |
| **Practice modes** | Flashcard Drill (review) and Sentence Builder (production) |
| **Gamification** | Per-prompt scoring (base + first-try + speed bonus); pass threshold 8/10 first-try correct to unlock next week |
| **Telemetry** | Single write per completed session via the `camper-telemetry` Edge Function (service-role insert); RLS denies all direct client table access |
| **Organizer analytics** | Password-protected `/admin` page + Supabase Edge Function (see [docs/ANALYTICS.md](docs/ANALYTICS.md)) |
| **Accessibility** | Skip link, reduced-motion (`MotionProvider`), 56px+ touch targets, modal drawer with focus trap, WAI-ARIA tabs |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, camp design tokens in `globals.css` |
| Motion | Framer Motion (`MotionConfig reducedMotion="user"`), CSS keyframes in `animations.css` |
| UI primitives | shadcn/ui (Base UI + CVA), custom camp components (`BentoGrid`, `CampScreenLayout`, …) |
| Data | Supabase Postgres via Deno **Edge Functions** (client uses `fetch` + `NEXT_PUBLIC_*` anon key; no browser DB client) |
| Deploy | Static export (`output: "export"`) → Cloudflare Pages (`out/`) |

Node **20+** required for local dev and CI.

---

## Quick start

```bash
git clone https://github.com/KamilLopez09/ELLevate.git
cd ELLevate
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production static export to `out/` |
| `npm run start` | Serve production build (after build) |
| `npm run lint` | ESLint via Next.js |

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (prod) | Anon key for client INSERT |
| `MAGIC_API_KEY` | No | Cursor Magic MCP only |
| `SUPABASE_ACCESS_TOKEN` | No | Cursor Supabase MCP only |

See [.env.example](.env.example).

---

## Supabase setup

Run migrations in order via the Supabase SQL Editor:

```
supabase/migrations/001_camper_telemetry.sql
002_camper_intake_fields.sql
003_add_gamification_stats.sql
004_game_mode_scoring.sql
005_age_brackets_5_9_10_14.sql
006_enforce_rls_policies.sql
007_coppa_compliance_schema.sql
008_telemetry_edge_write_proxy.sql
```

Fresh projects: run all eight. Existing projects: apply any missing files in sequence.

RLS **denies all direct table access** to the anon/authenticated roles (migration `008`). Telemetry is written by the **`camper-telemetry` Edge Function** using the service role key. Deploy the Edge Functions:

```bash
npm run supabase:deploy-organizer   # deploys both camper-telemetry and organizer-telemetry
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#telemetry--supabase) for the write pipeline and payload shape.

---

## Deploy (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `out` |
| Node version | 20+ |

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Pages project environment.

Details: [docs/PUBLISH.md](docs/PUBLISH.md)

---

## Project structure

```
src/
├── app/                          # Routes: /, /menu, /lesson, /application, /admin
├── components/
│   ├── sentence-canvas/          # Game mode UIs
│   ├── ui/                       # Camp shell, bento, scoreboard, shadcn button
│   └── providers/                # MotionProvider
├── data/                         # curriculum.ts, sentence-prompts (legacy)
├── lib/                          # session, curriculum engine, gamification, supabase
├── styles/animations.css
└── types/
supabase/migrations/              # Postgres schema + RLS
supabase/functions/               # Edge Functions (camper-telemetry write proxy, organizer-telemetry reads)
docs/                             # Architecture, design ADRs, progress log
.cursor/mcp.json                # Cursor MCP server config
.agents/skills/                   # Vercel agent skills (optional dev tooling)
components.json                   # shadcn/ui config
```

---

## Documentation

| Doc | Audience | Contents |
|-----|----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | SWE review | Routes, session state, scoring, build/deploy |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | **Camp organizers** | `/admin` page + Supabase dashboard + SQL |
| [docs/CONSTRAINTS.md](docs/CONSTRAINTS.md) | Team | Known limits (static app, telemetry timing, RLS) |
| [docs/RESOLVE.md](docs/RESOLVE.md) | Team | Phased roadmap (session, telemetry, admin UI) |
| [docs/DESIGN.md](docs/DESIGN.md) | SWE / PM | Architecture decision records |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Team | Chronological build log |
| [docs/PUBLISH.md](docs/PUBLISH.md) | DevOps | GitHub + Cloudflare workflow |
| [docs/CURSOR_SETUP.md](docs/CURSOR_SETUP.md) | Contributors | MCP + agent skills setup |

---

## Development methodology

ELLevate was built with AI used as an **agentic syntax accelerator, not an
architect**. A human engineer owns the architecture, data model, and COPPA/RLS
security decisions; AI agents handle mechanical execution — scaffolding
components, applying repetitive edits, and drafting docs — inside **strict
engineering constraints**:

- **Constraints are written down first.** [docs/CONSTRAINTS.md](docs/CONSTRAINTS.md),
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/DESIGN.md](docs/DESIGN.md)
  define the guardrails (static export, edge-function-validated telemetry writes, COPPA-minimized
  identity) that every AI-generated change must satisfy.
- **The build is the arbiter.** Generated code is only accepted if it type-checks,
  lints, and produces a working static export — no unverified output is trusted.
- **Docs track reality, not intent.** Documentation is kept aligned to the code
  that actually ships (see this repo's cleanup log), so AI assistance never
  introduces "hallucination debris" that drifts from the real system.

The result: AI speeds up the typing, human judgment keeps the architecture honest.

---

## License

Sample curriculum content is for development. Replace with properly licensed ESL corpora before production camp use.
