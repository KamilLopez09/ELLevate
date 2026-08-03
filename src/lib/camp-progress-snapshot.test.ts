import { beforeEach, describe, expect, it } from "vitest";
import {
  CURRENT_WEEK_KEY,
  LESSON_COMPLETE_KEY,
} from "@/lib/camp-session-keys";
import {
  applyCampProgressSnapshot,
  captureCampProgressSnapshot,
  type CampProgressSnapshot,
} from "@/lib/camp-progress-snapshot";
import { writeCamperSession } from "@/lib/camper-session";
import { touchCampSessionClock } from "@/lib/session-store";
import type { CamperSessionData } from "@/types/sentence-canvas";

const camper: CamperSessionData = {
  camper_id: "maria-g",
  first_name: "Maria",
  last_initial: "G",
  age_bracket: "5-9",
  native_language: "English",
  group_letter: "A",
  cumulativeScore: 0,
  completedModes: [],
  unlockedAchievements: [],
};

describe("camp progress snapshots", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
  });

  it("captures legacy lesson completion as the active week", () => {
    writeCamperSession(camper);
    window.localStorage.setItem(CURRENT_WEEK_KEY, "4");
    window.localStorage.setItem(LESSON_COMPLETE_KEY, "true");

    const snapshot = captureCampProgressSnapshot();

    expect(snapshot?.lessonCompleteWeek).toBe(4);
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBe("4");
  });

  it("restores legacy lesson completion against the saved current week", () => {
    const snapshot: CampProgressSnapshot = {
      camper,
      currentWeek: 5,
      weekPassed: {},
      lessonComplete: true,
    };

    expect(applyCampProgressSnapshot(snapshot)).toBe(true);
    expect(window.localStorage.getItem(CURRENT_WEEK_KEY)).toBe("5");
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBe("5");
  });
});
