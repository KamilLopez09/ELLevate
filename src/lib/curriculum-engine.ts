import {
  curriculum,
  type BracketContent,
  type LessonWeek,
  type Prompt,
} from "@/data/curriculum";
import type { AgeBracket } from "@/types/sentence-canvas";
import type { GameMode } from "@/types/sentence-canvas";

export const CURRENT_WEEK_KEY = "currentWeek";

export const WEEK_NUMBERS = Object.keys(curriculum)
  .map(Number)
  .sort((a, b) => a - b);

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
  window.sessionStorage.setItem(weekPassedKey(weekNumber), "true");
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

export function getBracketContent(
  weekNumber: number,
  ageBracket: AgeBracket,
): BracketContent | null {
  const week = getLessonWeek(weekNumber);
  if (!week) {
    return null;
  }
  return week.brackets[ageBracket] ?? null;
}

export function curriculumModeToGameMode(
  mode: BracketContent["mode"],
): GameMode {
  return mode === "drag-match" ? "drag" : "click";
}

export function getPromptsForSession(
  weekNumber: number,
  ageBracket: AgeBracket,
): Prompt[] {
  return getBracketContent(weekNumber, ageBracket)?.prompts ?? [];
}
