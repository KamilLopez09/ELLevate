import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "@/lib/achievements";

describe("evaluateAchievements", () => {
  it("grants first_pass from progress when a week is already passed", () => {
    const newly = evaluateAchievements(
      null,
      { weeksPassed: 1, cumulativeScore: 0, completedModes: [] },
      [],
    );
    expect(newly).toContain("first_pass");
  });

  it("does not grant first_pass when no weeks passed and no pass context", () => {
    const newly = evaluateAchievements(
      null,
      { weeksPassed: 0, cumulativeScore: 0, completedModes: [] },
      [],
    );
    expect(newly).not.toContain("first_pass");
  });

  it("preserves already unlocked badges when re-evaluating", () => {
    const newly = evaluateAchievements(
      null,
      { weeksPassed: 4, cumulativeScore: 600, completedModes: ["a", "b", "c"] },
      ["first_pass", "halfway_hero"],
    );
    expect(newly).not.toContain("first_pass");
    expect(newly).not.toContain("halfway_hero");
    expect(newly).toContain("points_500");
    expect(newly).toContain("mode_explorer");
  });
});
