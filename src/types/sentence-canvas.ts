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

export interface CamperTelemetryRow {
  module_name: "sentence_canvas";
  score: number;
  error_count: number;
}

export type FeedbackState = "idle" | "correct" | "incorrect";

export type SwatchColor = "purple" | "gold" | "teal";
