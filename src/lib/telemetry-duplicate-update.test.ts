import { describe, expect, it } from "vitest";
import { shouldUpdateDuplicateTelemetry } from "../../supabase/functions/_shared/telemetry-duplicate-update";

describe("shouldUpdateDuplicateTelemetry", () => {
  it("rejects duplicate updates that would lower the cumulative score", () => {
    expect(
      shouldUpdateDuplicateTelemetry(
        { cumulative_score: 500, total_points: 100 },
        { cumulative_score: 450, total_points: 130 },
      ),
    ).toBe(false);
  });

  it("allows scoring improvements when cumulative score is monotonic", () => {
    expect(
      shouldUpdateDuplicateTelemetry(
        { cumulative_score: 500, total_points: 100 },
        { cumulative_score: 500, total_points: 130 },
      ),
    ).toBe(true);

    expect(
      shouldUpdateDuplicateTelemetry(
        { cumulative_score: 500, total_points: 130 },
        { cumulative_score: 550, total_points: 120 },
      ),
    ).toBe(true);
  });

  it("ignores duplicates that do not improve stored scores", () => {
    expect(
      shouldUpdateDuplicateTelemetry(
        { cumulative_score: 500, total_points: 130 },
        { cumulative_score: 500, total_points: 120 },
      ),
    ).toBe(false);
  });
});
