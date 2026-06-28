import {
  curriculum,
  type AgeGroup,
  type BracketData,
  type LessonWeek,
  type Prompt,
} from "@/data/curriculum";
import type { AgeBracket } from "@/types/sentence-canvas";

export const CURRENT_WEEK_KEY = "currentWeek";

export const WEEK_NUMBERS = Object.keys(curriculum)
  .map(Number)
  .sort((a, b) => a - b);

export const TOTAL_WEEKS = WEEK_NUMBERS.length;

export function weekPassedKey(weekNumber: number): string {
  return `lesson_${weekNumber}_passed`;
}

export function getCurrentWeek(): number {
  if (typeof window === "undefined") {
    return 1;
  }
  const raw = window.sessionStorage.getItem(CURRENT_WEEK_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return curriculum[parsed] ? parsed : 1;
}

export function setCurrentWeek(weekNumber: number): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(CURRENT_WEEK_KEY, String(weekNumber));
}

export function isWeekPassed(weekNumber: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(weekPassedKey(weekNumber)) === "true";
}

export function setWeekPassed(weekNumber: number): void {
  if (typeof window === "undefined") {
    return;
  }
  const completedWeek = Math.max(1, Math.floor(weekNumber));
  window.sessionStorage.setItem(weekPassedKey(completedWeek), "true");
}

/**
 * Marks the week the camper just finished and returns the next week number
 * that becomes unlocked (strict integer math: completed + 1).
 */
export function markWeekCompleted(completedWeekNumber: number): number {
  const completedWeek = Math.max(1, Math.floor(completedWeekNumber));
  setWeekPassed(completedWeek);
  return completedWeek + 1;
}

/** Week 1 is always available; later weeks require the prior week to pass. */
export function isWeekUnlocked(weekNumber: number): boolean {
  if (weekNumber <= 1) {
    return true;
  }
  return isWeekPassed(weekNumber - 1);
}

export function getLessonWeek(weekNumber: number): LessonWeek | null {
  return curriculum[weekNumber] ?? null;
}

export function toAgeGroup(ageBracket: AgeBracket): AgeGroup {
  return ageBracket;
}

/** Maps legacy demo brackets (e.g. 8-10) to the current age-group keys. */
export function resolveAgeGroup(ageBracket?: string): AgeGroup {
  if (ageBracket === "10-14" || ageBracket === "11-14") {
    return "10-14";
  }
  return "5-9";
}

export function getBracketContent(
  weekNumber: number,
  ageBracket: AgeBracket,
): BracketData | null {
  const week = getLessonWeek(weekNumber);
  if (!week) {
    return null;
  }
  return week.brackets[toAgeGroup(ageBracket)] ?? null;
}

export function getVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
}

export function getPromptsForSession(
  weekNumber: number,
  ageBracket: AgeBracket,
): Prompt[] {
  return getBracketContent(weekNumber, ageBracket)?.prompts ?? [];
}

/** Human-readable practice structure shown on the lesson screen. */
export function getLessonPracticePlan(weekNumber: number): string {
  if (weekNumber <= 1) {
    return "10 practice questions from this week's video (greetings and to be).";
  }
  return "3 review questions from last week, then 4 from this video, then 3 challenge questions.";
}
