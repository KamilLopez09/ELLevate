/** Prompts per practice session (canonical count for pass scoring). */
export const SESSION_PROMPT_COUNT = 10;

/**
 * Minimum first-try correct answers required to pass a week.
 * Keep in sync with PASS_THRESHOLD in `supabase/functions/camper-telemetry/index.ts`.
 */
export const PASS_THRESHOLD = 8;

/** Minimum seconds on the lesson video page before practice unlocks (unless camper confirms watch). */
export const VIDEO_MIN_WATCH_SECONDS = 15;
