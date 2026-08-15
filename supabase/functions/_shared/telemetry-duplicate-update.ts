export interface DuplicateTelemetryScores {
  cumulative_score: number | null;
  total_points: number | null;
}

/**
 * Duplicate week telemetry is allowed to improve scoring, but never to regress
 * the cumulative score that drives standings.
 */
export function shouldUpdateDuplicateTelemetry(
  existing: DuplicateTelemetryScores | null,
  incoming: DuplicateTelemetryScores,
): boolean {
  if (existing === null) {
    return false;
  }

  const existingCumulative = existing.cumulative_score ?? 0;
  const existingTotalPoints = existing.total_points ?? 0;
  const incomingCumulative = incoming.cumulative_score ?? 0;
  const incomingTotalPoints = incoming.total_points ?? 0;

  if (incomingCumulative < existingCumulative) {
    return false;
  }

  return (
    incomingCumulative > existingCumulative ||
    incomingTotalPoints > existingTotalPoints
  );
}
