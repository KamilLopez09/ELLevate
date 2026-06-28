import type { Prompt } from "@/data/curriculum";
import type { ScoreResult, GameModeId } from "@/lib/gamification";

export interface GameModeCompletePayload {
  scoreResult: ScoreResult;
  firstTry: boolean;
  correct: boolean;
}

export interface GameModeProps {
  prompts: Prompt[];
  gameModeId: GameModeId;
  onComplete: (payload: GameModeCompletePayload) => void;
}
