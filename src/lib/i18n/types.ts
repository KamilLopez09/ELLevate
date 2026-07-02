import type { NativeLanguage } from "@/types/sentence-canvas";

export type Locale = "en" | "es";

export function localeFromNativeLanguage(
  language: NativeLanguage | "" | undefined,
): Locale {
  return language === "Spanish" ? "es" : "en";
}

export interface CampCopy {
  intake: {
    welcomeLabel: string;
    title: string;
    subtitle: string;
    firstName: string;
    lastInitial: string;
    lastInitialHint: string;
    ageBracket: string;
    ageBracketPlaceholder: string;
    ageBracketLabels: Record<"5-9" | "10-14", string>;
    homeLanguage: string;
    homeLanguagePlaceholder: string;
    campGroup: string;
    privacyTitle: string;
    privacyBody: (ttlHours: number) => string;
    privacyCounselor: string;
    continue: string;
    errors: {
      incomplete: string;
      invalidGroup: string;
      invalidName: string;
    };
  };
  menu: {
    loading: string;
    journeyLabel: string;
    greeting: (name: string) => string;
    subtitle: string;
    weeksPassed: (passed: number, total: number) => string;
    totalPoints: (points: string) => string;
    resetDevice: string;
    footer: string;
    weekOf: (week: number, total: number) => string;
    passedReplay: string;
    start: string;
    unlockHint: (prevWeek: number) => string;
  };
  lesson: {
    loading: string;
    backToMenu: string;
    weekTheme: (week: number, theme: string) => string;
    watchIntro: string;
    promptCount: (count: number) => string;
    modeLabel: string;
    modeDragMatch: string;
    modeClickPaint: string;
    readyToPractice: string;
    watchGateHint: (secondsLeft: number) => string;
    watchedCheckbox: string;
    watchGateReady: string;
  };
  practice: {
    loading: string;
    noPrompts: (week: number, ageGroup: string) => string;
    paintModeTitle: string;
    paintModeHint: string;
    paintedProgress: (done: number, total: number) => string;
    reviewFlashcard: string;
    practiceBuilder: string;
    noCurriculum: (week: number, ageGroup: string) => string;
    telemetryWarning: string;
  };
  retry: {
    title: string;
    body: (correct: number, total: number, threshold: number) => string;
    tryAgain: string;
    tryAgainAria: string;
  };
  celebration: {
    weekComplete: string;
    passedWeek: (week: number) => string;
    summary: (
      theme: string,
      correct: number,
      total: number,
      threshold: number,
    ) => string;
    seeScore: string;
  };
  scoreboard: {
    greatWork: string;
    pointsEarned: (points: number) => string;
    persistence: string;
    basePoints: string;
    firstTryBonuses: string;
    speedBonuses: string;
    accuracy: string;
    returnToMenu: string;
    returnToMenuAria: string;
    saving: string;
    gameModes: {
      flashcard_drill: string;
      sentence_builder: string;
      match_blitz: string;
      rapid_fire: string;
    };
  };
  reset: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
  skipLink: string;
}
