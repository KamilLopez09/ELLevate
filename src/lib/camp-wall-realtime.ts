import type { SupabaseClient, REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import type { CampWallPassPayload } from "@/types/camp-wall";

/** Subscribe to organizer camp wall pass events (Batch G5). */
export function subscribeCampWall(
  supabase: SupabaseClient,
  channelName: string,
  onPass: (payload: CampWallPassPayload) => void,
  onStatus?: (status: REALTIME_SUBSCRIBE_STATES) => void,
): () => void {
  const channel = supabase
    .channel(channelName)
    .on("broadcast", { event: "pass" }, (message) => {
      const payload = message.payload as CampWallPassPayload | undefined;
      if (!payload?.first_name || !payload.week_number) {
        return;
      }
      onPass(payload);
    })
    .subscribe((status) => {
      onStatus?.(status);
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
