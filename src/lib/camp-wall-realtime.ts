import type { SupabaseClient, REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import type { CampWallPassPayload } from "@/types/camp-wall";

export interface CampWallSubscribeOptions {
  /** When false, uses a public Realtime channel (fallback if private auth is blocked). */
  privateChannel?: boolean;
}

/** Subscribe to organizer camp wall pass events (private Realtime channel by default). */
export async function subscribeCampWall(
  supabase: SupabaseClient,
  channelName: string,
  accessToken: string,
  onPass: (payload: CampWallPassPayload) => void,
  onStatus?: (status: REALTIME_SUBSCRIBE_STATES) => void,
  options?: CampWallSubscribeOptions,
): Promise<() => void> {
  await Promise.resolve(supabase.realtime.setAuth(accessToken));

  const privateChannel = options?.privateChannel !== false;
  const channel = supabase
    .channel(channelName, {
      config: { private: privateChannel },
    })
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
