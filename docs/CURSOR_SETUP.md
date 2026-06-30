# Cursor AI development stack

Optional tooling for contributors using [Cursor](https://cursor.com). **Not required** to run or deploy ELLevate — production builds ignore MCP and agent skills.

For application architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## What's configured

| Integration | Type | Purpose |
|-------------|------|---------|
| **shadcn MCP** | MCP | Browse and install shadcn/ui components |
| **web-design-guidelines** (+ 8 Vercel skills) | Agent skill | UI/accessibility audits |
| **Chrome DevTools MCP** | MCP | Live browser testing, screenshots, performance |
| **Magic MCP (21st.dev)** | MCP | AI-generated UI drafts (requires API key) |
| **Supabase MCP** | MCP | Schema and migration review (requires access token) |

| File / directory | Role |
|------------------|------|
| `.cursor/mcp.json` | MCP server definitions (committed) |
| `.agents/skills/` | Vercel agent skills (committed) |
| `components.json` | shadcn/ui project config |
| `skills-lock.json` | Skills CLI lockfile |

---

## Setup (new contributor)

```bash
git clone https://github.com/KamilLopez09/ELLevate.git
cd ELLevate
npm install
cp .env.example .env.local
```

### MCP servers

1. Open the project in Cursor.
2. Go to **Customize** (sidebar) → **MCP**, or **Settings → Tools & MCP**.
3. Enable servers from `.cursor/mcp.json`.
4. Restart Cursor if tools do not appear.

MCP config loads from `.cursor/mcp.json` when the project opens — toggles may not be required on all Cursor versions.

### Optional API keys

Set in your shell profile (never commit):

```bash
export MAGIC_API_KEY="..."           # https://21st.dev/magic/console
export SUPABASE_ACCESS_TOKEN="sbp_..." # https://supabase.com/dashboard/account/tokens
```

Restart Cursor after setting env vars. The app itself only needs `NEXT_PUBLIC_SUPABASE_*` in `.env.local`.

### Agent skills

Skills in `.agents/skills/` should auto-discover. If missing:

```bash
npx skills add vercel-labs/agent-skills -a cursor -y
```

Invoke in Agent chat with `/web-design-guidelines` or natural language ("audit against web design guidelines").

---

## Example prompts

With `npm run dev` running:

```
Audit src/components/sentence-canvas/ against web design guidelines
```

```
Add a dialog component from shadcn for the retry modal
```

```
Open localhost:3000/menu and screenshot at 375px mobile width
```

---

## Maintenance

**Re-init shadcn MCP** (may overwrite `.cursor/mcp.json` — verify other servers remain):

```bash
npx shadcn@latest mcp init --client cursor
```

**Debug MCP issues:** View → Output → **MCP Logs** in Cursor.

---

## Security

- MCP servers can execute local commands and access configured APIs.
- Never commit API keys; use `${env:...}` placeholders in `.cursor/mcp.json`.
- Review third-party MCP packages before enabling in production-adjacent environments.
