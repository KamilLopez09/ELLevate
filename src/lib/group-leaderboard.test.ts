import { describe, expect, it } from "vitest";
import { buildGroupLeaderboardFromRows } from "@/lib/group-leaderboard";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";

function telemetryRow(
  overrides: Partial<CamperTelemetryRecord>,
): CamperTelemetryRecord {
  return {
    id: "row",
    completed_at: "2026-07-03T12:00:00.000Z",
    camper_id: "camper-c",
    first_name: "Camper",
    last_initial: "C",
    age_bracket: "5-9",
    native_language: "English",
    group_letter: "A",
    week_number: 1,
    correct_first_try: 8,
    accuracy_rate: 80,
    error_count: 2,
    game_mode: "sentence_builder",
    total_points: 100,
    cumulative_score: 100,
    ...overrides,
  };
}

describe("buildGroupLeaderboardFromRows", () => {
  it("uses the latest telemetry row's cumulative score for admin standings", () => {
    const board = buildGroupLeaderboardFromRows(
      [
        telemetryRow({
          id: "maria-old",
          completed_at: "2026-07-03T12:00:00.000Z",
          camper_id: "maria-g",
          first_name: "Maria",
          last_initial: "G",
          week_number: 1,
          cumulative_score: 900,
        }),
        telemetryRow({
          id: "maria-latest",
          completed_at: "2026-07-03T13:00:00.000Z",
          camper_id: "maria-g",
          first_name: "Marisol",
          last_initial: "G",
          week_number: 2,
          cumulative_score: 200,
        }),
        telemetryRow({
          id: "zoe-latest",
          completed_at: "2026-07-03T12:30:00.000Z",
          camper_id: "zoe-z",
          first_name: "Zoe",
          last_initial: "Z",
          week_number: 1,
          cumulative_score: 300,
        }),
      ],
      "A",
    );

    expect(board.entries).toMatchObject([
      {
        camper_id: "zoe-z",
        rank: 1,
        cumulative_score: 300,
      },
      {
        camper_id: "maria-g",
        rank: 2,
        display_name: "Marisol G.",
        cumulative_score: 200,
        weeks_passed: 2,
      },
    ]);
  });
});
