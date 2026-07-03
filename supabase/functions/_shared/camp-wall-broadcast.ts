/** Sanitized pass event for organizer camp wall (no camper_id). */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

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

function sanitizeWallName(name: string): string {
  const cleaned = name
    .replace(/[^\p{L}\p{M}' -]/gu, "")
    .trim()
    .slice(0, 40);
  return cleaned.length >= 1 ? cleaned : "Camper";
}

export function buildCampWallPayload(
  row: {
    first_name: string;
    last_initial: string;
    group_letter: string;
    week_number: number;
    correct_first_try: number;
    accuracy_rate: number;
    total_points: number;
  },
  completedAt?: string,
): CampWallPassPayload {
  return {
    completed_at: completedAt ?? new Date().toISOString(),
    first_name: sanitizeWallName(row.first_name),
    last_initial: row.last_initial,
    group_letter: row.group_letter,
    week_number: row.week_number,
    correct_first_try: row.correct_first_try,
    accuracy_rate: row.accuracy_rate,
    total_points: row.total_points,
  };
}

async function waitForChannelSubscribe(
  channel: ReturnType<SupabaseClient["channel"]>,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Realtime subscribe timed out"));
    }, 4000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timeout);
        reject(new Error(`Realtime subscribe failed: ${status}`));
      }
    });
  });
}

/** Broadcast a pass event to the organizer camp wall channel (best-effort). */
export async function broadcastCampWallPass(
  supabase: SupabaseClient,
  channelName: string,
  payload: CampWallPassPayload,
): Promise<void> {
  const channel = supabase.channel(channelName);
  await waitForChannelSubscribe(channel);
  await channel.send({
    type: "broadcast",
    event: "pass",
    payload,
  });
  await supabase.removeChannel(channel);
}
