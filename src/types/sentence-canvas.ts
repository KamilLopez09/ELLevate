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
}

export interface CamperTelemetryRow {
  module_name: "sentence_canvas";
  score: number;
  error_count: number;
  camper_id: string;
  age_bracket: AgeBracket;
  native_language: NativeLanguage;
}

export type FeedbackState = "idle" | "correct" | "incorrect";

export type SwatchColor = "purple" | "gold" | "teal";
