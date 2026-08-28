import type { SessionScoreSummary } from "@/lib/gamification";
import type {
  CamperSessionData,
  CamperTelemetryRow,
} from "@/types/sentence-canvas";

interface BuildLessonTelemetryPayloadArgs {
  camper: CamperSessionData;
  correctFirstTry: number;
  errorCount: number;
  gameMode: string;
  sessionSummary: SessionScoreSummary;
  totalPrompts: number;
  weekNumber: number;
}

export function buildLessonTelemetryPayload({
  camper,
  correctFirstTry,
  errorCount,
  gameMode,
  sessionSummary,
  totalPrompts,
  weekNumber,
}: BuildLessonTelemetryPayloadArgs): CamperTelemetryRow {
  const accuracyRate =
    totalPrompts > 0
      ? Number(((correctFirstTry / totalPrompts) * 100).toFixed(2))
      : 0;

  return {
    module_name: "sentence_canvas",
    score: correctFirstTry,
    error_count: errorCount,
    game_mode: gameMode,
    base_points: sessionSummary.results.reduce(
      (sum, result) => sum + result.base,
      0,
    ),
    first_try_bonus: sessionSummary.totalFirstTryBonus,
    speed_bonus: sessionSummary.totalSpeedBonus,
    total_points: sessionSummary.totalPoints,
    week_number: weekNumber,
    correct_first_try: correctFirstTry,
    cumulative_score: camper.cumulativeScore,
    speed_bonuses_earned: sessionSummary.totalSpeedBonus,
    accuracy_rate: accuracyRate,
    camper_id: camper.camper_id,
    first_name: camper.first_name,
    last_initial: camper.last_initial,
    age_bracket: camper.age_bracket,
    native_language: camper.native_language,
    group_letter: camper.group_letter,
  };
}
