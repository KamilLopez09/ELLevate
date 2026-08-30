import { describe, expect, it } from "vitest";
import {
  appendCampWallPassEvent,
  telemetryRowsToCampWallEvents,
} from "@/lib/camp-wall-events";
import type { CamperTelemetryRecord } from "@/lib/organizer-api";
import type { CampWallPassEvent, CampWallPassPayload } from "@/types/camp-wall";

const passPayload: CampWallPassPayload = {
  completed_at: "2026-07-03T12:00:00.000Z",
  first_name: "Maya",
  last_initial: "R",
  group_letter: "B",
  week_number: 3,
  correct_first_try: 9,
  accuracy_rate: 90,
  total_points: 120,
};

describe("appendCampWallPassEvent", () => {
  it("does not append a pass that is already displayed", () => {
    const existing: CampWallPassEvent[] = [{ ...passPayload, id: "existing" }];

    const result = appendCampWallPassEvent(
      existing,
      passPayload,
      "replayed",
      40,
    );

    expect(result).toBe(existing);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("existing");
  });

  it("prepends new passes and caps the feed", () => {
    const older: CampWallPassEvent = {
      ...passPayload,
      completed_at: "2026-07-03T11:00:00.000Z",
      id: "older",
    };

    const result = appendCampWallPassEvent([older], passPayload, "new", 1);

    expect(result).toEqual([{ ...passPayload, id: "new" }]);
  });
});

describe("telemetryRowsToCampWallEvents", () => {
  it("omits camper IDs from organizer wall pass payloads", () => {
    const [event] = telemetryRowsToCampWallEvents([
      {
        id: "row-1",
        camper_id: "maya-r",
        age_bracket: "5-9",
        native_language: "English",
        error_count: 1,
        game_mode: "sentence_builder",
        cumulative_score: 420,
        ...passPayload,
      } satisfies CamperTelemetryRecord,
    ]);

    expect(event).toEqual(passPayload);
    expect(event).not.toHaveProperty("camper_id");
  });
});
