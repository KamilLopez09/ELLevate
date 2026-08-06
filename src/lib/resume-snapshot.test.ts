import { describe, expect, it } from "vitest";
import { validateSnapshot } from "../../supabase/functions/_shared/resume-snapshot";

describe("validateSnapshot", () => {
  it("preserves pass-session badges when normalizing resume snapshots", () => {
    const result = validateSnapshot({
      camper: {
        camper_id: "maria-g",
        first_name: "Maria",
        last_initial: "G",
        age_bracket: "10-14",
        native_language: "Spanish",
        group_letter: "A",
        cumulativeScore: 600,
        completedModes: ["flashcard_drill", "match_blitz", "rapid_fire"],
        unlockedAchievements: ["perfect_week", "speed_star", "not_real"],
      },
      weekPassed: {
        "1": true,
        "2": true,
        "3": true,
        "4": true,
      },
      currentWeek: 5,
      sessionStartedAt: 1_700_000_000_000,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.snapshot.camper.unlockedAchievements).toEqual([
      "first_pass",
      "halfway_hero",
      "mode_explorer",
      "points_500",
      "perfect_week",
      "speed_star",
    ]);
  });
});
