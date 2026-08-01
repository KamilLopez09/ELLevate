import { beforeEach, describe, expect, it } from "vitest";
import {
  applyPassedWeekProgress,
  getLessonCompleteWeek,
  isLessonCompleteForWeek,
  readCamperSession,
  setLessonComplete,
  clearLessonComplete,
  writeCamperSession,
} from "@/lib/camper-session";
import { weekPassedKey } from "@/lib/camp-session-keys";
import { touchCampSessionClock } from "@/lib/session-store";

describe("lesson complete per week", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
  });

  it("tracks completion for a specific week only", () => {
    setLessonComplete(2);
    expect(getLessonCompleteWeek()).toBe(2);
    expect(isLessonCompleteForWeek(2)).toBe(true);
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });

  it("clears the gate when starting a new week", () => {
    setLessonComplete(1);
    clearLessonComplete();
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });
});

describe("passed week progress", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
    writeCamperSession({
      camper_id: "maria-g",
      first_name: "Maria",
      last_initial: "G",
      age_bracket: "5-9",
      native_language: "English",
      group_letter: "A",
      cumulativeScore: 100,
      completedModes: ["sentence_builder"],
      unlockedAchievements: [],
    });
  });

  it("adds points and marks the week on first pass", () => {
    const applied = applyPassedWeekProgress(1, 120, [
      "sentence_builder",
      "match_blitz",
    ]);

    expect(applied).toBe(true);
    expect(window.localStorage.getItem(weekPassedKey(1))).toBe("true");
    expect(readCamperSession()).toMatchObject({
      cumulativeScore: 220,
      completedModes: ["sentence_builder", "match_blitz"],
    });
  });

  it("does not add points or modes when replaying an already-passed week", () => {
    window.localStorage.setItem(weekPassedKey(1), "true");

    const applied = applyPassedWeekProgress(1, 200, ["rapid_fire"]);

    expect(applied).toBe(false);
    expect(readCamperSession()).toMatchObject({
      cumulativeScore: 100,
      completedModes: ["sentence_builder"],
    });
  });
});
