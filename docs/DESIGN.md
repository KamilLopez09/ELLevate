# ELLevate — Design Decisions & Alternatives

This document records why we chose the current architecture for the Sentence Canvas module, and what we considered instead.

## Deployment: Static Export vs. Full Next.js on Cloudflare

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Static export (`output: "export"`) on native Cloudflare Pages** | Simple Pages deploy (build `npm run build`, output `out/`); no server runtime; fast CDN delivery; build-time env injection | No API routes or SSR; all Supabase calls client-side | **Selected** — matches free camp hosting and anon-key-only constraint |
| Workers + OpenNext (`opennextjs-cloudflare`) | Full SSR/App Router on Workers | Expects `output: "standalone"`; failed against our static export (`ENOENT … pages-manifest.json`) | Rejected — wrong tool for a static-only app |
| Workers + static assets (`wrangler deploy` + `wrangler.jsonc`) | Serves `out/` via a Worker | Extra config; contradicts "bypass Workers" rule | Tried then removed (see PROGRESS.md) |
| `@cloudflare/next-on-pages` | Full App Router features, edge middleware | More complex build; overkill for one client module | Rejected for v1 |
| Vite + React SPA | Lighter bundle | Loses Next.js file routing and future SSR path | Rejected — user specified Next.js |

The deployment journey (OpenNext failure → Workers static assets → native Pages) is logged in [PROGRESS.md](PROGRESS.md).

## Telemetry: End-of-Session INSERT vs. Per-Click Writes

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Single INSERT after 5 sentences** | Minimal DB load; anti-spam friendly; privacy-preserving | No per-question analytics | **Selected** — per requirements |
| INSERT on every click | Granular funnels | Spam/abuse risk; cost; needs auth | Rejected |
| LocalStorage queue + batch | Offline resilience | Sync complexity | Deferred — can add later |

## Supabase Security: RLS-Only Anon vs. Edge Function Proxy

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Supabase Edge Function write proxy** (`camper-telemetry`) | Validates payload server-side; inserts with service role; client has **no** DB write access | One more function to deploy | **Selected (current)** |
| RLS with anon INSERT, no SELECT | No backend to maintain; works with static export | Anon key can write directly; validation limited to RLS check constraints | **Superseded** — was v1.0; replaced to close the direct-write path |
| Service role from client | — | Critical security flaw | Never |

> **Update (v1.1):** Telemetry writes moved from a direct anon `INSERT` to the
> `camper-telemetry` Edge Function. Migration `008` revokes client INSERT, so the
> anon/authenticated roles now have no table privileges. The Edge Function
> re-validates every field (mirroring the DB constraints) and forwards only
> whitelisted columns before inserting with the service role key.

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

---

## Gamification & pass threshold (Milestone 10+)

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **8/10 first-try pass to unlock next week** | Clear camp progression; retry without DB writes on fail | Stricter than single 80% session metric | **Selected** — drives curriculum unlock |
| Pass on any completion | Lower friction | Weak mastery signal | Rejected |
| Per-mode telemetry rows | Rich analytics | 4× DB load; complexity | Rejected for v1 |

Scoring constants live in `lib/gamification.ts` per game mode (base, first-try, speed caps).

---

## Session storage vs. server auth

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **`localStorage` + 12-hour TTL** | Survives refresh/tab close; resilient across a camp day on shared iPads; still no backend | Single device only; manual reset between children | **Selected (current)** |
| `sessionStorage` progression flags | Zero backend; tab-scoped privacy | Lost on tab close — child loses progress if the tab closes | **Superseded** — see [RESOLVE.md](RESOLVE.md) Phase 1 |
| Supabase auth per camper | Persistent identity | COPPA/auth burden; overkill for camp kiosk | Rejected for v1 |
| JWT in cookie | Cross-tab | Needs server or edge auth | Rejected |

> **Update:** Session state moved from `sessionStorage` to `localStorage` with a
> 12-hour TTL (`src/lib/session-store.ts`) so an accidental tab close no longer
> wipes a camper's identity and unlocked weeks. See
> [CONSTRAINTS.md](CONSTRAINTS.md#browser-session-localstorage-12-hour-ttl--resolved).

---

## Accessibility & motion (Milestone 11)

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **`MotionConfig reducedMotion="user"` app-wide** | One config honors OS setting for all Framer Motion | Does not cover raw CSS keyframes alone | **Selected** — paired with CSS `@media (prefers-reduced-motion)` |
| Per-component motion guards | Fine-grained | Easy to miss new components | Supplemented, not primary |
| Disable all animation | Simplest a11y | Removes core camp delight | Rejected |

Mobile nav uses a focus-trapped modal drawer rather than a non-modal overlay — required for keyboard and screen-reader users on shared camp tablets.

---

## shadcn/ui adoption

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **shadcn + camp token mapping** | Accessible primitives; MCP-assisted installs; stays in-repo | Extra deps; must not override camp visual identity | **Selected** for incremental primitives (Button, future Dialog) |
| Full shadcn default theme | Fast bootstrap | Conflicts with Certified Angels palette | Rejected — tokens mapped in `globals.css` |
| Custom components only | Full brand control | Slower to add complex a11y patterns | Partial — camp components remain primary |

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — routes, session keys, telemetry flow
- [PROGRESS.md](PROGRESS.md) — implementation timeline
- [CURSOR_SETUP.md](CURSOR_SETUP.md) — optional AI dev tooling
