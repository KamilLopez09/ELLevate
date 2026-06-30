# ELLevate

Free, interactive ESL web application for **Certified Angels** — an arts-based youth summer camp. Campers ages 5–14 practice English and Spanish through game-like modules instead of traditional tests.

**Production:** static export on Cloudflare Pages · **Backend:** Supabase (anonymous INSERT-only telemetry)

---

## Features

| Area | Description |
|------|-------------|
| **Intake** | COPPA-aware session gate (`first_name`, last initial, age bracket `5-9` / `10-14`, language, camp group) stored in **localStorage** (12-hour TTL) |
| **8-week curriculum** | Week themes, YouTube embeds, age-bracket prompts in `src/data/curriculum.ts` |
| **Lesson flow** | `/` → `/menu` → `/lesson` (video) → `/application` (practice) with week unlock progression; **New camper** reset on menu for shared tablets |
| **Practice modes** | Flashcard Drill (review) and Sentence Builder (production); Match Blitz and Rapid Fire scaffolded for post-launch |
| **Gamification** | Per-prompt scoring (base + first-try + speed bonus); pass threshold 8/10 first-try correct to unlock next week |
| **Telemetry** | Single Supabase INSERT per completed session; RLS restricts anon to INSERT only |
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
| Drag-and-drop | Swapy (Match Blitz — post-launch) |
| Data | Supabase JS client (browser-only, `NEXT_PUBLIC_*` keys) |
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
```

Fresh projects: run all seven. Existing projects: apply any missing files in sequence.

RLS allows **anonymous INSERT only** — no SELECT for campers. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#telemetry--supabase) for payload shape.

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
supabase/functions/               # Edge Functions (organizer-telemetry)
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

## License

Sample curriculum content is for development. Replace with properly licensed ESL corpora before production camp use.
