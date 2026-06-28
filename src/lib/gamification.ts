export interface ScoreResult {
  base: number;
  firstTryBonus: number;
  speedBonus: number;
  total: number;
}

export type GameModeId =
  | "flashcard_drill"
  | "match_blitz"
  | "sentence_builder"
  | "rapid_fire";

interface ModeConstants {
  base: number;
  firstTry: number;
  speedMax: number;
}

const MODE_CONSTANTS: Record<GameModeId, ModeConstants> = {
  flashcard_drill: { base: 60, firstTry: 20, speedMax: 10 },
  match_blitz: { base: 70, firstTry: 20, speedMax: 20 },
  sentence_builder: { base: 90, firstTry: 30, speedMax: 10 },
  rapid_fire: { base: 50, firstTry: 10, speedMax: 30 },
};

const SPEED_BONUS_FLOOR_MS = 3000;
const SPEED_BONUS_CEILING_MS = 10000;

/** Max bonus below 3s; linear decay to 0 at 10s. */
export function calculateSpeedBonus(
  timeTakenMs: number,
  maxBonus: number,
): number {
  if (timeTakenMs < SPEED_BONUS_FLOOR_MS) {
    return maxBonus;
  }
  if (timeTakenMs >= SPEED_BONUS_CEILING_MS) {
    return 0;
  }
  const ratio =
    (SPEED_BONUS_CEILING_MS - timeTakenMs) /
    (SPEED_BONUS_CEILING_MS - SPEED_BONUS_FLOOR_MS);
  return Math.round(maxBonus * ratio);
}

export interface ScoreInput {
  firstTry: boolean;
  timeTakenMs: number;
  correct: boolean;
}

export function calculateFlashcardScore(input: ScoreInput): ScoreResult {
  return buildScore("flashcard_drill", input);
}

export function calculateMatchBlitzScore(input: ScoreInput): ScoreResult {
  return buildScore("match_blitz", input);
}

export function calculateSentenceBuilderScore(input: ScoreInput): ScoreResult {
  return buildScore("sentence_builder", input);
}

export function calculateRapidFireScore(input: ScoreInput): ScoreResult {
  return buildScore("rapid_fire", input);
}

export function calculateScoreForMode(
  mode: GameModeId,
  input: ScoreInput,
): ScoreResult {
  switch (mode) {
    case "flashcard_drill":
      return calculateFlashcardScore(input);
    case "match_blitz":
      return calculateMatchBlitzScore(input);
    case "sentence_builder":
      return calculateSentenceBuilderScore(input);
    case "rapid_fire":
      return calculateRapidFireScore(input);
  }
}

function buildScore(mode: GameModeId, input: ScoreInput): ScoreResult {
  const config = MODE_CONSTANTS[mode];
  const base = input.correct ? config.base : 0;
  const firstTryBonus =
    input.correct && input.firstTry ? config.firstTry : 0;
  const speedBonus = input.correct
    ? calculateSpeedBonus(input.timeTakenMs, config.speedMax)
    : 0;

  return {
    base,
    firstTryBonus,
    speedBonus,
    total: base + firstTryBonus + speedBonus,
  };
}

export interface SessionScoreSummary {
  results: ScoreResult[];
  totalPoints: number;
  totalFirstTryBonus: number;
  totalSpeedBonus: number;
  correctFirstTry: number;
  totalPrompts: number;
}

export function summarizeSession(
  results: ScoreResult[],
  correctFirstTry: number,
): SessionScoreSummary {
  return {
    results,
    totalPoints: results.reduce((sum, result) => sum + result.total, 0),
    totalFirstTryBonus: results.reduce(
      (sum, result) => sum + result.firstTryBonus,
      0,
    ),
    totalSpeedBonus: results.reduce(
      (sum, result) => sum + result.speedBonus,
      0,
    ),
    correctFirstTry,
    totalPrompts: results.length,
  };
}
