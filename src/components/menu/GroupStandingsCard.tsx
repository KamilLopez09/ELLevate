"use client";

import { useCallback, useEffect, useState } from "react";
import { BentoCard } from "@/components/ui/BentoGrid";
import {
  fetchGroupLeaderboard,
  type GroupLeaderboardResult,
} from "@/lib/group-leaderboard";
import { useCopy } from "@/lib/i18n/useCopy";
import { PROGRESS_SYNCED_EVENT } from "@/lib/progress-events";

// Keep passive polling well below the public endpoint's per-IP quota; progress
// sync, focus, and visibility events still refresh immediately.
const PASSIVE_REFRESH_INTERVAL_MS = 5 * 60_000;

export function GroupStandingsCard({
  groupLetter,
  camperId,
}: {
  groupLetter: string;
  camperId: string;
}) {
  const copy = useCopy();
  const [standings, setStandings] = useState<GroupLeaderboardResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await fetchGroupLeaderboard(groupLetter, camperId);
    if (result !== null) {
      setStandings(result);
    }
    setLoading(false);
  }, [camperId, groupLetter]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      const result = await fetchGroupLeaderboard(groupLetter, camperId);
      if (!cancelled) {
        setStandings(result);
        setLoading(false);
      }
    })();

    const onSync = () => {
      if (!cancelled) {
        void refresh();
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    };

    window.addEventListener(PROGRESS_SYNCED_EVENT, onSync);
    window.addEventListener("focus", onSync);
    document.addEventListener("visibilitychange", onVisible);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    }, PASSIVE_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener(PROGRESS_SYNCED_EVENT, onSync);
      window.removeEventListener("focus", onSync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [camperId, groupLetter, refresh]);

  return (
    <BentoCard index={0} span="sm:col-span-6" accent="teal" tilt={0.5}>
      <p className="text-bento-label font-semibold uppercase tracking-widest text-teal-accent">
        {copy.leaderboard.title}
      </p>
      {loading ? (
        <p className="mt-3 text-ink/70">{copy.leaderboard.loading}</p>
      ) : !standings || standings.total_in_group === 0 ? (
        <p className="mt-3 text-ink/70">{copy.leaderboard.empty}</p>
      ) : (
        <>
          {standings.your_rank !== null ? (
            <p className="mt-3 text-lg font-bold text-ink">
              {copy.leaderboard.yourRank(
                standings.your_rank,
                standings.total_in_group,
                groupLetter,
              )}
            </p>
          ) : (
            <p className="mt-3 text-lg font-bold text-ink">
              {copy.leaderboard.groupLabel(groupLetter)}
            </p>
          )}
          <ol className="mt-4 space-y-2">
            {standings.entries.slice(0, 5).map((entry) => (
              <li
                key={`${entry.rank}-${entry.display_name}`}
                className={[
                  "flex items-center justify-between rounded-xl px-4 py-2 text-sm",
                  entry.is_you
                    ? "bg-teal-accent/15 font-bold text-ink"
                    : "bg-paper/80 text-ink/85",
                ].join(" ")}
              >
                <span>
                  <span className="tabular-nums text-muted-foreground">
                    #{entry.rank}
                  </span>{" "}
                  {entry.display_name}
                  {entry.is_you ? (
                    <span className="ml-2 text-bento-label text-teal-accent">
                      {copy.leaderboard.you}
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums font-semibold">
                  {entry.cumulative_score.toLocaleString()}{" "}
                  <span className="font-normal text-muted-foreground">
                    {copy.leaderboard.points}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </BentoCard>
  );
}
