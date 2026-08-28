import { describe, expect, it } from "vitest";
import { buildLessonTelemetryPayload } from "@/lib/lesson-telemetry";
import type { SessionScoreSummary } from "@/lib/gamification";
import type { CamperSessionData } from "@/types/sentence-canvas";

describe("buildLessonTelemetryPayload", () => {
  it("uses the updated camper score and session totals for passed lessons", () => {
    const camper: CamperSessionData = {
      camper_id: "maria-g",
      first_name: "Maria",
      last_initial: "G",
      age_bracket: "10-14",
      native_language: "Spanish",
      group_letter: "B",
      cumulativeScore: 1420,
      completedModes: ["sentence_builder"],
    };
    const sessionSummary: SessionScoreSummary = {
      results: [
        { base: 90, firstTryBonus: 30, speedBonus: 10, total: 130 },
        { base: 90, firstTryBonus: 0, speedBonus: 5, total: 95 },
      ],
      totalPoints: 225,
      totalFirstTryBonus: 30,
      totalSpeedBonus: 15,
      correctFirstTry: 1,
      totalPrompts: 2,
    };

    const payload = buildLessonTelemetryPayload({
      camper,
      correctFirstTry: 1,
      errorCount: 1,
      gameMode: "sentence_builder",
      sessionSummary,
      totalPrompts: 2,
      weekNumber: 4,
    });

    expect(payload).toMatchObject({
      camper_id: "maria-g",
      cumulative_score: 1420,
      total_points: 225,
      base_points: 180,
      first_try_bonus: 30,
      speed_bonus: 15,
      speed_bonuses_earned: 15,
      accuracy_rate: 50,
      week_number: 4,
    });
  });
});
