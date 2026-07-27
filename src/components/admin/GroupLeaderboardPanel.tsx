"use client";

import { useMemo } from "react";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";
import {
  buildGroupLeaderboardFromRows,
  type GroupLeaderboardResult,
} from "@/lib/group-leaderboard";
import { uniqueGroupLetters } from "@/lib/organizer-filters";

export function GroupLeaderboardPanel({
  rows,
  activeGroup,
}: {
  rows: CamperTelemetryRecord[];
  activeGroup: string;
}) {
  const groups = useMemo(() => uniqueGroupLetters(rows), [rows]);

  const boards = useMemo(() => {
    const targetGroups =
      activeGroup !== "all" ? [activeGroup] : groups.length > 0 ? groups : [];

    return targetGroups.map((group) =>
      buildGroupLeaderboardFromRows(rows, group),
    );
  }, [rows, activeGroup, groups]);

  if (boards.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-paper p-6 shadow-bento">
        <h2 className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          Group leaderboard
        </h2>
        <p className="mt-3 text-ink/70">
          No group standings yet. Scores appear after campers pass practice weeks.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          Group leaderboard
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          Ranked by each camper&apos;s latest cumulative points (COPPA-safe: first
          name and last initial only).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {boards.map((board) => (
          <LeaderboardTable key={board.group_letter} board={board} />
        ))}
      </div>
    </section>
  );
}

function LeaderboardTable({ board }: { board: GroupLeaderboardResult }) {
  const top = board.entries.slice(0, 15);

  return (
    <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento">
      <h3 className="font-display text-xl font-extrabold text-ink">
        Group {board.group_letter}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {board.total_in_group} camper{board.total_in_group === 1 ? "" : "s"}
      </p>
      {top.length === 0 ? (
        <p className="mt-4 text-sm text-ink/70">No scores yet.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {top.map((entry) => (
            <li
              key={entry.camper_id}
              className="flex items-center justify-between rounded-xl bg-surface-muted/60 px-3 py-2 text-sm"
            >
              <span>
                <span className="mr-2 tabular-nums font-bold text-muted-foreground">
                  #{entry.rank}
                </span>
                {entry.display_name}
              </span>
              <span className="tabular-nums font-semibold text-ink">
                {entry.cumulative_score.toLocaleString()} pts ·{" "}
                {entry.weeks_passed} wk
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
