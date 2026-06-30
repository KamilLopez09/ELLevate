# ELLevate — Analyzing camper interactions

**Audience:** Camp organizers, teachers, and you (the project owner) — not software engineers required.

**Short answer:** When a camper **passes** a week’s practice (8 of 10 correct on first try) and taps back to the menu, ELLevate writes **one row** to Supabase. You read those rows in the Supabase website. There is no separate “analytics app” in v1.

---

## What gets recorded (and what does not)

| Camper action | Saved to Supabase? |
|---------------|-------------------|
| Fills intake form | No — stays on device only |
| Watches YouTube lesson | No |
| Gets answers wrong and retries | No |
| Passes the week (≥ 8/10 first-try) and returns to menu | **Yes — one row** |
| Fails the week (&lt; 8/10) | No |

So each row ≈ **“this camper passed this week’s practice session”** with scores and demographics — not a video of every click.

---

## Step-by-step: view rows in Supabase

1. Log in to [supabase.com](https://supabase.com) and open your ELLevate project.
2. In the left sidebar, open **Table Editor**.
3. Select the table **`camper_telemetry`**.
4. Sort by **`completed_at`** (newest first) to see recent sessions.

You need **project owner** or a role with SELECT on this table. Campers using the public app **cannot** read this table (by design).

---

## What each column means

| Column | Meaning |
|--------|---------|
| `completed_at` | When the row was saved (UTC timestamp) |
| `camper_id` | Stable slug, e.g. `maria-g` from first name + last initial |
| `first_name` | First name from intake |
| `last_initial` | Single letter — COPPA-friendly |
| `age_bracket` | `5-9` or `10-14` |
| `native_language` | `English` or `Spanish` |
| `group_letter` | Camp group `A`–`Z` |
| `week_number` | Which curriculum week (1–8) they passed |
| `correct_first_try` | How many of 10 prompts correct on first try (pass needs ≥ 8) |
| `score` | Same as `correct_first_try` in current app (legacy name) |
| `accuracy_rate` | Percent correct first try (0–100) |
| `error_count` | Wrong attempts during the session |
| `game_mode` | Main mode used: `flashcard_drill` or `sentence_builder` |
| `base_points`, `first_try_bonus`, `speed_bonus`, `total_points` | Gamification breakdown |
| `cumulative_score` | Running total on **this device** (not all-time across devices) |
| `module_name` | Always `sentence_canvas` for current practice |

---

## Useful SQL queries

Open **SQL Editor** in Supabase, paste a query, click **Run**.

### Passes today

```sql
select
  first_name,
  last_initial,
  group_letter,
  week_number,
  correct_first_try,
  accuracy_rate,
  completed_at
from public.camper_telemetry
where completed_at >= current_date
order by completed_at desc;
```

### Pass rate by week

```sql
select
  week_number,
  count(*) as passes,
  round(avg(accuracy_rate), 1) as avg_accuracy_pct
from public.camper_telemetry
group by week_number
order by week_number;
```

### Activity by camp group

```sql
select
  group_letter,
  count(*) as sessions,
  count(distinct camper_id) as unique_campers
from public.camper_telemetry
group by group_letter
order by group_letter;
```

### One camper’s history (by slug)

```sql
select *
from public.camper_telemetry
where camper_id = 'maria-g'
order by completed_at;
```

---

## Export for Excel or Google Sheets

In **Table Editor**, use Supabase’s export (CSV) on `camper_telemetry`, or run any query above and export results from the SQL Editor.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| No rows at all | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set on Cloudflare Pages; or camper never **passed** a week |
| Camper saw yellow “score saved on this device” banner | Insert failed or env missing — row not in Supabase; progress still on device |
| Duplicate-looking rows | Same camper passed **different weeks** — one row per pass; or they passed the same week again on a **replay** (each pass inserts again) |
| Cannot open Table Editor | Wrong Supabase account or missing project access |

After deploy, confirm env vars and run one test pass locally or on staging.

---

## Future: admin dashboard (optional)

If SQL feels too technical for counselors, see **Phase 3** in [RESOLVE.md](RESOLVE.md) — a small password-protected `/admin` page. Until then, Supabase Table Editor + the queries above are the supported workflow.

---

## Privacy note

Rows contain **minimal** child info (first name + initial, age bracket, group). Do not share Supabase dashboard access broadly. For COPPA context see migration `007_coppa_compliance_schema.sql` and intake design in [ARCHITECTURE.md](ARCHITECTURE.md).
