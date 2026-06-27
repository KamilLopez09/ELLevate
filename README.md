# ELLevate

A free, interactive ESL web application for **Certified Angels** — an arts-based youth summer camp. ELLevate helps campers ages 5–14 practice English and Spanish through creative, game-like modules instead of traditional tests.

## Sentence Canvas (Module 01)

Campers see a bilingual sentence with a missing verb. Three colorful "paint swatch" buttons offer conjugation choices. Tap the right one and Framer Motion springs the word into the blank. Wrong picks trigger a gentle shake.

Telemetry (score + error count) is sent **once** when all 5 sentences are complete.

## Tech Stack

- **Next.js 15** (App Router, static export)
- **Tailwind CSS** — creative canvas design system
- **Framer Motion** — spring fill + shake feedback
- **Supabase** — anonymous INSERT-only telemetry (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Design Decisions

See [docs/DESIGN.md](docs/DESIGN.md) for architecture alternatives we considered (static export vs. edge Next.js, click-to-fill vs. drag-and-drop, end-of-session telemetry vs. per-click writes, etc.).

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a Supabase project.
2. Run the migration in [supabase/migrations/001_camper_telemetry.sql](supabase/migrations/001_camper_telemetry.sql) via the SQL Editor.
3. Copy **Project URL** and **anon public key** into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

RLS allows anonymous INSERTs only (no SELECT for campers).

## Deploy to Cloudflare Pages

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `out` |
| Node version | 20+ |

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Cloudflare Pages dashboard.

## Project Structure

```
src/
├── app/                    # Routes (home + sentence-canvas)
├── components/sentence-canvas/
├── data/sentence-prompts.ts  # Hardcoded content (swap for OSS corpora later)
├── lib/supabase/
└── types/
supabase/migrations/        # camper_telemetry schema + RLS
docs/DESIGN.md                # Architecture & UX rationale
```

## License

Content placeholders are original samples for development. Replace with properly licensed open-source ESL corpora before production camp use.
