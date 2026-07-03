import type { CamperTelemetryRecord } from "@/lib/organizer-api";
import type { CampWallPassPayload } from "@/types/camp-wall";

/** Map organizer telemetry rows to sanitized camp-wall payloads (no camper_id). */
export function telemetryRowsToCampWallEvents(
  rows: CamperTelemetryRecord[],
): CampWallPassPayload[] {
  return rows.map((row) => ({
    completed_at: row.completed_at,
    first_name: row.first_name,
    last_initial: row.last_initial,
    group_letter: row.group_letter,
    week_number: row.week_number,
    correct_first_try: row.correct_first_try,
    accuracy_rate: row.accuracy_rate,
    total_points: row.total_points,
  }));
}

export function campWallEventKey(payload: CampWallPassPayload): string {
  return `${payload.completed_at}-${payload.first_name}-${payload.last_initial}-${payload.group_letter}-${payload.week_number}`;
}
