import { describe, expect, it } from "vitest";
import { buildGroupLeaderboardFromRows } from "@/lib/group-leaderboard";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";

function row(
  overrides: Partial<CamperTelemetryRecord> = {},
): CamperTelemetryRecord {
  return {
    id: "1",
    completed_at: "2026-07-01T12:00:00.000Z",
    camper_id: "maria-g",
    first_name: "Maria",
    last_initial: "G",
    age_bracket: "5-9",
    native_language: "Spanish",
    group_letter: "A",
    week_number: 1,
    correct_first_try: 8,
    accuracy_rate: 80,
    error_count: 2,
    game_mode: "flashcard_drill",
    total_points: 100,
    cumulative_score: 100,
    ...overrides,
  };
}

describe("buildGroupLeaderboardFromRows", () => {
  it("uses the latest telemetry row for each camper's cumulative score", () => {
    const board = buildGroupLeaderboardFromRows(
      [
        row({
          id: "old",
          completed_at: "2026-07-27T13:00:00.000Z",
          week_number: 1,
          cumulative_score: 250,
        }),
        row({
          id: "latest",
          completed_at: "2026-07-27T13:05:00.000Z",
          week_number: 2,
          cumulative_score: 175,
        }),
      ],
      "A",
      "maria-g",
    );

    expect(board.entries).toHaveLength(1);
    expect(board.entries[0]).toMatchObject({
      camper_id: "maria-g",
      cumulative_score: 175,
      weeks_passed: 2,
      is_you: true,
    });
  });

  it("still ranks by latest cumulative score after grouping campers", () => {
    const board = buildGroupLeaderboardFromRows(
      [
        row({
          id: "maria-week-1",
          completed_at: "2026-07-27T13:00:00.000Z",
          week_number: 1,
          cumulative_score: 500,
        }),
        row({
          id: "maria-week-2",
          completed_at: "2026-07-27T13:05:00.000Z",
          week_number: 2,
          cumulative_score: 200,
        }),
        row({
          id: "sofia-week-1",
          completed_at: "2026-07-27T13:03:00.000Z",
          camper_id: "sofia-r",
          first_name: "Sofia",
          last_initial: "R",
          week_number: 1,
          cumulative_score: 250,
        }),
      ],
      "A",
    );

    expect(board.entries.map((entry) => entry.camper_id)).toEqual([
      "sofia-r",
      "maria-g",
    ]);
  });
});
