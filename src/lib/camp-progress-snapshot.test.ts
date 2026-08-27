import { beforeEach, describe, expect, it } from "vitest";
import { CAMPER_SESSION_KEY } from "@/lib/camp-session-keys";
import {
  applyCampProgressSnapshot,
  type CampProgressSnapshot,
} from "@/lib/camp-progress-snapshot";
import { readCamperSession } from "@/lib/camper-session";

function snapshot(cumulativeScore: number): CampProgressSnapshot {
  return {
    camper: {
      camper_id: "maria-a",
      first_name: "Maria",
      last_initial: "A",
      age_bracket: "5-9",
      native_language: "Spanish",
      group_letter: "B",
      cumulativeScore,
      completedModes: ["sentence_builder"],
      unlockedAchievements: ["first_pass", "points_1000"],
    },
    currentWeek: 3,
    weekPassed: { "1": true, "2": true },
    lessonCompleteWeek: 3,
    selectedGameMode: "sentence_builder",
  };
}

describe("applyCampProgressSnapshot", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("preserves cumulative scores above a single-week maximum", () => {
    expect(applyCampProgressSnapshot(snapshot(2600))).toBe(true);
    expect(readCamperSession()?.cumulativeScore).toBe(2600);
  });

  it("rejects impossible cumulative scores above the full camp maximum", () => {
    expect(applyCampProgressSnapshot(snapshot(10401))).toBe(false);
    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBeNull();
  });
});
