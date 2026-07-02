import type { Prompt } from "@/data/curriculum";
import { isClickPaintPrompt, isDragMatchPrompt } from "@/lib/prompt-utils";
import { isGameModeId, type GameModeId } from "@/lib/gamification";

/** Session uses automatic per-prompt routing (legacy default). */
export const AUTO_GAME_MODE = "auto";

/**
 * Resolves scoring/UI mode for a prompt given an optional session override.
 * Review prompts always use flashcard drill.
 */
export function resolveGameMode(
  prompt: Prompt,
  selectedMode: string | null,
): GameModeId {
  if (prompt.category === "review") {
    return "flashcard_drill";
  }

  const selection = selectedMode?.trim() || AUTO_GAME_MODE;

  if (selection === AUTO_GAME_MODE) {
    return "sentence_builder";
  }

  if (!isGameModeId(selection)) {
    return "sentence_builder";
  }

  if (selection === "flashcard_drill") {
    return "flashcard_drill";
  }

  if (selection === "match_blitz") {
    return isDragMatchPrompt(prompt) ? "match_blitz" : "rapid_fire";
  }

  if (selection === "rapid_fire") {
    return isClickPaintPrompt(prompt) ? "rapid_fire" : "match_blitz";
  }

  return selection;
}

export function pickTelemetryGameMode(
  modesUsed: Set<GameModeId>,
  selectedMode: string | null,
): GameModeId {
  if (selectedMode && isGameModeId(selectedMode)) {
    return selectedMode;
  }
  if (modesUsed.has("sentence_builder")) {
    return "sentence_builder";
  }
  if (modesUsed.has("match_blitz")) {
    return "match_blitz";
  }
  if (modesUsed.has("rapid_fire")) {
    return "rapid_fire";
  }
  return "flashcard_drill";
}
