import { beforeEach, describe, expect, it } from "vitest";
import {
  CURRENT_WEEK_KEY,
  LESSON_COMPLETE_KEY,
  SELECTED_GAME_MODE_KEY,
  weekPassedKey,
} from "@/lib/camp-session-keys";
import { applyCampProgressSnapshot } from "@/lib/camp-progress-snapshot";
import {
  getCampSessionItem,
  touchCampSessionClock,
} from "@/lib/session-store";
import { TELEMETRY_QUEUE_KEY } from "@/lib/telemetry-queue";
import type { CamperSessionData } from "@/types/sentence-canvas";
import {
  getLessonCompleteWeek,
  isLessonCompleteForWeek,
  setLessonComplete,
  clearLessonComplete,
  readCamperSession,
  startNewCamperSession,
} from "@/lib/camper-session";

const newCamper: CamperSessionData = {
  camper_id: "new-camper-n",
  first_name: "New",
  last_initial: "N",
  age_bracket: "5-9",
  native_language: "English",
  group_letter: "B",
  cumulativeScore: 0,
  completedModes: [],
  unlockedAchievements: [],
};

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

describe("camper session isolation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("starts a new camper without inheriting stale progress keys", () => {
    window.localStorage.setItem(CURRENT_WEEK_KEY, "8");
    window.localStorage.setItem(LESSON_COMPLETE_KEY, "8");
    window.localStorage.setItem(SELECTED_GAME_MODE_KEY, "rapid_fire");
    window.localStorage.setItem(weekPassedKey(8), "true");
    window.localStorage.setItem(
      TELEMETRY_QUEUE_KEY,
      JSON.stringify([{ camper_id: "previous-camper" }]),
    );

    startNewCamperSession(newCamper);

    expect(readCamperSession()?.camper_id).toBe("new-camper-n");
    expect(window.localStorage.getItem(CURRENT_WEEK_KEY)).toBeNull();
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBeNull();
    expect(window.localStorage.getItem(SELECTED_GAME_MODE_KEY)).toBeNull();
    expect(window.localStorage.getItem(weekPassedKey(8))).toBeNull();
    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).not.toBeNull();
  });

  it("restores a resume snapshot after clearing stale progress keys", () => {
    window.localStorage.setItem(CURRENT_WEEK_KEY, "8");
    window.localStorage.setItem(LESSON_COMPLETE_KEY, "8");
    window.localStorage.setItem(SELECTED_GAME_MODE_KEY, "rapid_fire");
    window.localStorage.setItem(weekPassedKey(8), "true");
    window.localStorage.setItem(
      TELEMETRY_QUEUE_KEY,
      JSON.stringify([{ camper_id: "previous-camper" }]),
    );

    const applied = applyCampProgressSnapshot({
      camper: {
        ...newCamper,
        cumulativeScore: 100,
      },
      weekPassed: { "1": true },
    });

    expect(applied).toBe(true);
    expect(readCamperSession()?.camper_id).toBe("new-camper-n");
    expect(getCampSessionItem(weekPassedKey(1))).toBe("true");
    expect(window.localStorage.getItem(CURRENT_WEEK_KEY)).toBeNull();
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBeNull();
    expect(window.localStorage.getItem(SELECTED_GAME_MODE_KEY)).toBeNull();
    expect(window.localStorage.getItem(weekPassedKey(8))).toBeNull();
    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).not.toBeNull();
  });
});
