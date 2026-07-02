"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  clearLegacyOrganizerPasswordStorage,
  downloadCsv,
  fetchOrganizerTelemetry,
  telemetryRowsToCsv,
  type CamperTelemetryRecord,
  type OrganizerSummary,
} from "@/lib/organizer-api";

/** Certified Angels camp local time — Postgres still stores UTC in the database. */
const CAMP_TIME_ZONE = "America/New_York";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: CAMP_TIME_ZONE,
      dateStyle: "medium",
      timeStyle: "short",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function SummaryCards({ summary }: { summary: OrganizerSummary }) {
  const weekEntries = Object.entries(summary.passesByWeek).sort(
    ([a], [b]) => Number(a) - Number(b),
  );
  const groupEntries = Object.entries(summary.passesByGroup).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento">
        <p className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          Total passes logged
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold text-ink">
          {summary.totalSessions}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento">
        <p className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          Unique campers
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold text-ink">
          {summary.uniqueCampers}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento md:col-span-2 xl:col-span-1">
        <p className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          By week
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink/80">
          {weekEntries.length === 0 ? (
            <li>No passes yet.</li>
          ) : (
            weekEntries.map(([week, count]) => (
              <li key={week}>
                Week {week}: {count}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento md:col-span-2 xl:col-span-1">
        <p className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          By group
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink/80">
          {groupEntries.length === 0 ? (
            <li>No passes yet.</li>
          ) : (
            groupEntries.map(([group, count]) => (
              <li key={group}>
                Group {group}: {count}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function TelemetryTable({ rows }: { rows: CamperTelemetryRecord[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-paper p-6 text-center text-ink/70 shadow-bento">
        No camper sessions yet. Rows appear when a camper passes a week and
        returns to the menu.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-paper shadow-bento">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-bento-label uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Camper</th>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Week</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Accuracy</th>
            <th className="px-4 py-3">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 whitespace-nowrap text-ink/80">
                {formatWhen(row.completed_at)}
              </td>
              <td className="px-4 py-3">
                {row.first_name} {row.last_initial}.{" "}
                <span className="text-muted-foreground">({row.camper_id})</span>
              </td>
              <td className="px-4 py-3">{row.group_letter}</td>
              <td className="px-4 py-3">{row.week_number}</td>
              <td className="px-4 py-3">
                {row.correct_first_try}/10
              </td>
              <td className="px-4 py-3">{row.accuracy_rate}%</td>
              <td className="px-4 py-3">{row.total_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<CamperTelemetryRecord[]>([]);
  const [summary, setSummary] = useState<OrganizerSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    clearLegacyOrganizerPasswordStorage();
  }, []);

  const loadData = async (organizerPassword: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchOrganizerTelemetry(organizerPassword);
      setRows(result.rows);
      setSummary(result.summary);
      setPassword(organizerPassword);
      setAuthenticated(true);
    } catch (loadError) {
      setAuthenticated(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load camper data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = (event: React.FormEvent) => {
    event.preventDefault();
    void loadData(password.trim());
  };

  const handleSignOut = () => {
    setAuthenticated(false);
    setPassword("");
    setRows([]);
    setSummary(null);
    setError("");
  };

  const handleExport = () => {
    if (rows.length === 0) {
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`ellevate-telemetry-${stamp}.csv`, telemetryRowsToCsv(rows));
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-camp-blue px-4 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-bento-label font-semibold uppercase tracking-widest text-accent">
              Camp organizer
            </p>
            <h1
              className="mt-2 font-display font-extrabold text-ink"
              style={{ fontSize: "var(--text-h1)" }}
            >
              Camper activity
            </h1>
            <p className="mt-3 max-w-2xl text-ink/80">
              Password-protected view of passed practice sessions. Your password
              stays in this tab only — sign in again after refresh. Campers never
              see this page — bookmark{" "}
              <code className="rounded bg-paper/80 px-1.5 py-0.5 text-sm">
                /admin
              </code>{" "}
              on your laptop or counselor device.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-border bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
          >
            Back to camper app
          </Link>
        </header>

        {!authenticated ? (
          <form
            onSubmit={handleSignIn}
            className="max-w-md space-y-4 rounded-2xl border border-border bg-paper p-6 shadow-bento"
          >
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">
                Organizer password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="min-h-[56px] w-full rounded-xl border border-border bg-background px-4 text-ink"
                placeholder="Set in Supabase Edge Function secrets"
              />
            </label>
            {error ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="xl" disabled={loading || !password.trim()}>
              {loading ? "Loading…" : "View camper sessions"}
            </Button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="xl"
                onClick={() => void loadData(password)}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh data"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xl"
                onClick={handleExport}
                disabled={rows.length === 0}
              >
                Export CSV
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xl"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {summary ? <SummaryCards summary={summary} /> : null}
            <p className="text-sm text-ink/60">
              Session times are shown in Eastern (camp local). Supabase Table
              Editor displays the same moments in UTC (+00).
            </p>
            <TelemetryTable rows={rows} />
          </>
        )}
      </div>
    </main>
  );
}
