import type { CamperTelemetryRecord } from "@/lib/organizer-api";
import { getSupabaseConfig } from "@/lib/supabase/client";

export interface GroupLeaderboardEntry {
  rank: number;
  camper_id?: string;
  display_name: string;
  cumulative_score: number;
  weeks_passed: number;
  is_you?: boolean;
}

export interface GroupLeaderboardResult {
  group_letter: string;
  entries: GroupLeaderboardEntry[];
  your_rank: number | null;
  total_in_group: number;
}

export function buildGroupLeaderboardFromRows(
  rows: CamperTelemetryRecord[],
  groupLetter: string,
  camperId?: string,
): GroupLeaderboardResult {
  const normalizedGroup = groupLetter.trim().toUpperCase();
  const byCamper = new Map<
    string,
    {
      first_name: string;
      last_initial: string;
      cumulative_score: number;
      weeks: Set<number>;
    }
  >();

  for (const row of rows) {
    if (row.group_letter !== normalizedGroup) {
      continue;
    }

    const existing = byCamper.get(row.camper_id);
    const weeks = existing?.weeks ?? new Set<number>();
    weeks.add(row.week_number);

    const cumulative = Math.max(
      existing?.cumulative_score ?? 0,
      row.cumulative_score,
    );

    byCamper.set(row.camper_id, {
      first_name: row.first_name,
      last_initial: row.last_initial,
      cumulative_score: cumulative,
      weeks,
    });
  }

  const sorted = [...byCamper.entries()].sort((a, b) => {
    const scoreDiff = b[1].cumulative_score - a[1].cumulative_score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    const weekDiff = b[1].weeks.size - a[1].weeks.size;
    if (weekDiff !== 0) {
      return weekDiff;
    }
    return a[0].localeCompare(b[0]);
  });

  const entries: GroupLeaderboardEntry[] = sorted.map(([id, camper], index) => ({
    rank: index + 1,
    camper_id: id,
    display_name: `${camper.first_name} ${camper.last_initial}.`,
    cumulative_score: camper.cumulative_score,
    weeks_passed: camper.weeks.size,
    is_you: camperId ? id === camperId : undefined,
  }));

  const yourRank =
    camperId !== undefined
      ? (entries.find((entry) => entry.camper_id === camperId)?.rank ?? null)
      : null;

  return {
    group_letter: normalizedGroup,
    entries,
    your_rank: yourRank,
    total_in_group: entries.length,
  };
}

export async function fetchGroupLeaderboard(
  groupLetter: string,
  camperId: string,
): Promise<GroupLeaderboardResult | null> {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/functions/v1/group-leaderboard`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group_letter: groupLetter,
      camper_id: camperId,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GroupLeaderboardResult & {
    error?: string;
  };

  if (payload.error || !Array.isArray(payload.entries)) {
    return null;
  }

  return payload;
}
