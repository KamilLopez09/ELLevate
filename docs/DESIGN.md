# ELLevate — Design Decisions & Alternatives

This document records why we chose the current architecture for the Sentence Canvas module, and what we considered instead.

## Deployment: Static Export vs. Full Next.js on Cloudflare

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Static export (`output: "export"`)** | Simple Cloudflare Pages deploy; no server runtime cost; fast CDN delivery | No API routes or SSR; all Supabase calls client-side | **Selected** — matches free camp hosting and anon-key-only constraint |
| `@cloudflare/next-on-pages` | Full App Router features, edge middleware | More complex build; overkill for one client module | Rejected for v1 |
| Vite + React SPA | Lighter bundle | Loses Next.js file routing and future SSR path | Rejected — user specified Next.js |

## Telemetry: End-of-Session INSERT vs. Per-Click Writes

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Single INSERT after 5 sentences** | Minimal DB load; anti-spam friendly; privacy-preserving | No per-question analytics | **Selected** — per requirements |
| INSERT on every click | Granular funnels | Spam/abuse risk; cost; needs auth | Rejected |
| LocalStorage queue + batch | Offline resilience | Sync complexity | Deferred — can add later |

## Supabase Security: RLS-Only Anon vs. Edge Function Proxy

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **RLS with anon INSERT, no SELECT** | No backend to maintain; works with static export | Anon key is public (expected); rate limits rely on Supabase | **Selected** |
| Cloudflare Worker proxy | Hides table shape; custom validation | Extra infra; not static-export pure | Rejected for v1 |
| Service role from client | — | Critical security flaw | Never |

RLS policy constrains `module_name = 'sentence_canvas'` and `score` range to reduce abuse surface.

## Interaction: Click-to-Fill vs. Drag-and-Drop

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Click-to-fill paint swatches** | Works on touch kiosks; accessible; ages 5–14 friendly | Less "canvas" literal | **Selected** |
| Drag verb into blank | Strong metaphor | Hard for young kids on small screens; a11y burden | Rejected |
| Type-the-verb keyboard | Good for older students | Feels like school test | Rejected |

## Animation: Framer Motion layoutId vs. CSS-Only

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Framer Motion spring + layoutId** | Satisfying word "flies" into blank; shake on error | ~30kb gzip | **Selected** — tactile camp vibe |
| CSS `@keyframes` only | Zero JS animation lib | Harder shared-element transition | Rejected |
| Lottie celebrations | Rich effects | Asset pipeline overhead | Deferred |

## Content: Hardcoded TS vs. CMS / JSON Fetch

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Hardcoded `sentence-prompts.ts`** | Zero latency; easy swap later; static export safe | Requires redeploy for content changes | **Selected for v1** |
| Supabase content table | Dynamic updates | Extra RLS; fetch on load | Future |
| Open-source corpus (Tatoeba, etc.) | Scale | Licensing review; curation needed | Planned swap-in |

## Score Semantics

We track **total correct completions** (each sentence counts once when answered correctly) and **error_count** (every wrong swatch click). Alternative: first-try-only scoring — stricter but punishes exploration; rejected for a creative camp setting.
