import { beforeEach, describe, expect, it } from "vitest";
import {
  CURRENT_WEEK_KEY,
  LESSON_COMPLETE_KEY,
} from "@/lib/camp-session-keys";
import {
  getLessonCompleteWeek,
  isLessonComplete,
  isLessonCompleteForWeek,
  setLessonComplete,
  clearLessonComplete,
} from "@/lib/camper-session";
import { touchCampSessionClock } from "@/lib/session-store";

describe("lesson complete per week", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
  });

  it("tracks completion for a specific week only", () => {
    setLessonComplete(2);
    expect(getLessonCompleteWeek()).toBe(2);
    expect(isLessonComplete()).toBe(true);
    expect(isLessonCompleteForWeek(2)).toBe(true);
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });

  it("clears the gate when starting a new week", () => {
    setLessonComplete(1);
    clearLessonComplete();
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });

  it("migrates legacy boolean completion to the active week", () => {
    window.localStorage.setItem(CURRENT_WEEK_KEY, "3");
    window.localStorage.setItem(LESSON_COMPLETE_KEY, "true");

    expect(getLessonCompleteWeek()).toBe(3);
    expect(isLessonCompleteForWeek(3)).toBe(true);
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBe("3");
  });
});
