import { describe, expect, it } from "vitest";
import { filterTelemetryRows } from "@/lib/organizer-filters";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";

function row(completedAt: string): CamperTelemetryRecord {
  return {
    id: "1",
    completed_at: completedAt,
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
  };
}

describe("filterTelemetryRows date filters (America/New_York)", () => {
  it("includes an evening ET pass on the local calendar day", () => {
    // 2026-07-03 23:30 ET = 2026-07-04 03:30 UTC
    const rows = [row("2026-07-04T03:30:00.000Z")];
    const filtered = filterTelemetryRows(rows, {
      week: "all",
      group: "all",
      dateFrom: "2026-07-03",
      dateTo: "2026-07-03",
    });
    expect(filtered).toHaveLength(1);
  });

  it("excludes a pass that falls on the previous ET day", () => {
    const rows = [row("2026-07-04T03:30:00.000Z")];
    const filtered = filterTelemetryRows(rows, {
      week: "all",
      group: "all",
      dateFrom: "2026-07-04",
      dateTo: "2026-07-04",
    });
    expect(filtered).toHaveLength(0);
  });
});
