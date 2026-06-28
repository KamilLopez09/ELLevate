import type { Prompt } from "@/data/curriculum";
import type { ScoreResult } from "@/lib/gamification";

export interface GameModeCompletePayload {
  scoreResult: ScoreResult;
  firstTry: boolean;
  correct: boolean;
}

export interface GameModeProps {
  prompts: Prompt[];
  onComplete: (payload: GameModeCompletePayload) => void;
}
