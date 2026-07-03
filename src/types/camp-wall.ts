/** Sanitized pass event broadcast on the organizer camp wall (no camper_id). */

export interface CampWallPassPayload {
  completed_at: string;
  first_name: string;
  last_initial: string;
  group_letter: string;
  week_number: number;
  correct_first_try: number;
  accuracy_rate: number;
  total_points: number;
}

export interface CampWallPassEvent extends CampWallPassPayload {
  id: string;
}
