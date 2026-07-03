import { beforeEach, describe, expect, it } from "vitest";
import {
  getLessonCompleteWeek,
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
    expect(isLessonCompleteForWeek(2)).toBe(true);
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });

  it("clears the gate when starting a new week", () => {
    setLessonComplete(1);
    clearLessonComplete();
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });
});
