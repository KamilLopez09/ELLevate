# Cursor AI Stack for ELLevate

This project includes MCP servers and agent skills so Cursor can help build UI, audit accessibility, test in a live browser, and manage Supabase schema.

## What's installed

| Integration | Type | Purpose |
|-------------|------|---------|
| **shadcn MCP** | MCP | Browse and install shadcn/ui components into the project |
| **web-design-guidelines** (+ 8 Vercel skills) | Agent skill | Audit UI for accessibility, performance, and UX best practices |
| **Chrome DevTools MCP** | MCP | Live browser testing, screenshots, performance traces |
| **Magic MCP (21st.dev)** | MCP | AI-generated UI components (requires API key) |
| **Supabase MCP** | MCP | Schema, migrations, and RLS review (requires access token) |

Configuration lives in:

- `.cursor/mcp.json` — MCP server definitions (committed)
- `.agents/skills/` — Vercel agent skills (committed)
- `components.json` — shadcn/ui project config (committed)

## One-time setup (per developer)

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
# Add Supabase URL + anon key for the app
```

### 2. Enable MCP servers in Cursor

1. Open **Cursor Settings → Tools & MCP**
2. Enable all servers listed in `.cursor/mcp.json`
3. Restart Cursor if tools don't appear

### 3. Optional API keys (Magic + Supabase MCP)

Export these in your shell profile or set them in Cursor's MCP env (never commit real keys):

```bash
export MAGIC_API_KEY="your-21st-dev-key"        # https://21st.dev/magic/console
export SUPABASE_ACCESS_TOKEN="sbp_..."          # https://supabase.com/dashboard/account/tokens
```

The app itself only needs `NEXT_PUBLIC_SUPABASE_*` in `.env.local`.

## Using the stack

### shadcn MCP

With the dev server running, ask Cursor:

- "Add dialog and button from shadcn for the intake gatekeeper"
- "Show available form components in the shadcn registry"

New components install to `src/components/ui/` and use the camp design tokens in `globals.css`.

### web-design-guidelines skill

- "Audit `src/components/sentence-canvas/` against web design guidelines"
- "Check accessibility for campers ages 5–14 on the lesson page"
- Type `/web-design-guidelines` in Agent chat to invoke explicitly

### Chrome DevTools MCP

Start the app first (`npm run dev`), then:

- "Open localhost:3000/lesson and screenshot mobile viewport"
- "Check console errors on the application page"
- "Measure LCP on the home page"

Requires Node 20+ and a local Chrome/Chromium install.

### Magic MCP

- "Generate a camp-themed scoreboard card"
- Restyle Magic output to match ELLevate tokens (`camp-purple`, bento shadows, Nunito/Open Sans)

### Supabase MCP

- "Review RLS policies in supabase/migrations/"
- "Explain the camper_telemetry schema"

## Re-installing skills

If skills are missing after clone:

```bash
npx skills add vercel-labs/agent-skills -a cursor -y
```

## Re-initializing shadcn MCP

```bash
npx shadcn@latest mcp init --client cursor
```

This merges into `.cursor/mcp.json`; verify chrome-devtools, magic, and supabase entries remain after re-running.
