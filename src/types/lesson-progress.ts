export type LessonProgressOutcome = "pending" | "correct" | "incorrect";

export interface LessonProgressState {
  promptIndex: number;
  outcomes: LessonProgressOutcome[];
}

export const LESSON_TOTAL_PROMPTS = 10;

export function createInitialProgress(
  total = LESSON_TOTAL_PROMPTS,
): LessonProgressState {
  return {
    promptIndex: 0,
    outcomes: Array.from({ length: total }, () => "pending"),
  };
}
