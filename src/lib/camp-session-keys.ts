/** All localStorage keys used for camper progression (for bulk clear). */

export const CAMPER_SESSION_KEY = "camperSessionData";
export const LESSON_COMPLETE_KEY = "lesson_complete";
export const SELECTED_GAME_MODE_KEY = "selectedGameMode";
export const CURRENT_WEEK_KEY = "currentWeek";

export function weekPassedKey(weekNumber: number): string {
  return `lesson_${weekNumber}_passed`;
}

export function allCampSessionKeys(): string[] {
  const keys = [
    CAMPER_SESSION_KEY,
    LESSON_COMPLETE_KEY,
    SELECTED_GAME_MODE_KEY,
    CURRENT_WEEK_KEY,
  ];

  for (let week = 1; week <= 8; week += 1) {
    keys.push(weekPassedKey(week));
  }

  return keys;
}
