import { describe, expect, it } from "vitest";
import { escapeCsvCell, telemetryRowsToCsv } from "@/lib/organizer-api";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";

describe("escapeCsvCell", () => {
  it("prefixes formula-like values to block spreadsheet injection", () => {
    expect(escapeCsvCell("=cmd()")).toBe("'=cmd()");
    expect(escapeCsvCell("+1234")).toBe("'+1234");
    expect(escapeCsvCell("-sum(A1)")).toBe("'-sum(A1)");
  });

  it("quotes fields containing commas or quotes", () => {
    expect(escapeCsvCell('Say "hi"')).toBe('"Say ""hi"""');
  });
});

describe("telemetryRowsToCsv", () => {
  it("escapes dangerous first_name values in export", () => {
    const csv = telemetryRowsToCsv([
      {
        id: "1",
        completed_at: "2026-07-03T12:00:00.000Z",
        camper_id: "test-t",
        first_name: "=1+1",
        last_initial: "T",
        age_bracket: "5-9",
        native_language: "English",
        group_letter: "B",
        week_number: 2,
        correct_first_try: 10,
        accuracy_rate: 100,
        error_count: 0,
        game_mode: "rapid_fire",
        total_points: 120,
        cumulative_score: 220,
      } satisfies CamperTelemetryRecord,
    ]);
    expect(csv).toContain("'=1+1");
  });
});
