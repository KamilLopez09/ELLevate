export interface VerbOption {
  id: string;
  label: string;
}

export interface SentencePrompt {
  id: string;
  englishBefore: string;
  englishAfter: string;
  spanishHint: string;
  correctOptionId: string;
  options: VerbOption[];
}

export interface SessionStats {
  score: number;
  errorCount: number;
}

export type AgeBracket = "5-7" | "8-10" | "11-14";

export type NativeLanguage = "English" | "Spanish";

export interface CamperSessionData {
  camper_id: string;
  display_name: string;
  age_bracket: AgeBracket;
  native_language: NativeLanguage;
  group_letter: string;
  cumulativeScore: number;
  completedModes: string[];
}

export interface CamperTelemetryRow {
  module_name: "sentence_canvas";
  score: number;
  error_count: number;
  cumulative_score: number;
  speed_bonuses_earned: number;
  accuracy_rate: number;
  camper_id: string;
  display_name: string;
  age_bracket: AgeBracket;
  native_language: NativeLanguage;
  group_letter: string;
}

export type FeedbackState = "idle" | "correct" | "incorrect";

export type SwatchColor = "purple" | "gold" | "teal";

/** How the camper fills the blanks: tap a swatch, or drag a word block. */
export type GameMode = "click" | "drag";
