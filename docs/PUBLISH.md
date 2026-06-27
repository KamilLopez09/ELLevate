# Publish to GitHub

Run these commands from the project root after installing [Node.js 20+](https://nodejs.org/) and authenticating with GitHub.

## 1. Authenticate GitHub CLI

```powershell
gh auth login
```

Choose: GitHub.com → HTTPS → Login with browser.

## 2. Create remote repository and push

```powershell
cd C:\Users\CHANGEME\elle-vate

gh repo create elle-vate --public --source=. --remote=origin `
  --description "ELLevate — free interactive ESL app for Certified Angels summer camp"

git push -u origin feat/sentence-canvas
```

## 3. Open a pull request

If `main` does not exist on the remote yet, create it from the GitHub UI (empty README), then:

```powershell
gh pr create --base main --head feat/sentence-canvas `
  --title "Add Sentence Canvas module" `
  --body "## Summary
- Bootstrap Next.js static-export app with Certified Angels creative canvas UI
- Sentence Canvas: click-to-fill verb conjugation with Framer Motion
- Supabase camper_telemetry schema (anon INSERT only)
- Hardcoded 5 bilingual sample sentences

## Test plan
- [ ] npm install && npm run dev — complete all 5 sentences
- [ ] Verify spring animation on correct answer and shake on wrong
- [ ] Run Supabase migration; confirm single INSERT after session complete
- [ ] npm run build — confirm static export to out/"
```

Or merge directly on `main`:

```powershell
git branch -M main
git push -u origin main
```

## 4. Cloudflare Pages

Connect the GitHub repo in Cloudflare Pages:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `out` |

Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
