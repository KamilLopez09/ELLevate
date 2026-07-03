"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { subscribeCampWall } from "@/lib/camp-wall-realtime";
import { fetchOrganizerWallSession } from "@/lib/organizer-api";
import { getSupabaseConfig } from "@/lib/supabase/client";
import type { CampWallPassEvent } from "@/types/camp-wall";

const CAMP_TIME_ZONE = "America/New_York";
const MAX_EVENTS = 40;

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: CAMP_TIME_ZONE,
      timeStyle: "short",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function eventId(payload: CampWallPassEvent): string {
  return `${payload.completed_at}-${payload.first_name}-${payload.week_number}`;
}

export interface CampWallFeedProps {
  password: string;
}

export function CampWallFeed({ password }: CampWallFeedProps) {
  const [events, setEvents] = useState<CampWallPassEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "offline" | "disabled">(
    "connecting",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const connect = async () => {
      setStatus("connecting");
      setStatusMessage("Connecting to live camp feed…");

      try {
        const session = await fetchOrganizerWallSession(password);
        if (cancelled) {
          return;
        }

        if (!session.enabled || !session.channel) {
          setStatus("disabled");
          setStatusMessage(
            session.error ??
              "Camp wall is not configured. Set CAMP_WALL_CHANNEL in Supabase secrets.",
          );
          return;
        }

        const config = getSupabaseConfig();
        if (!config) {
          setStatus("offline");
          setStatusMessage("Supabase is not configured in this build.");
          return;
        }

        const supabase = createClient(config.url, config.key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        unsubscribe = subscribeCampWall(
          supabase,
          session.channel,
          (payload) => {
            const entry: CampWallPassEvent = {
              ...payload,
              id: crypto.randomUUID(),
            };
            const dedupeKey = eventId(entry);
            if (seenIds.current.has(dedupeKey)) {
              return;
            }
            seenIds.current.add(dedupeKey);

            setEvents((prev) => [entry, ...prev].slice(0, MAX_EVENTS));
          },
          (subscribeStatus) => {
            if (subscribeStatus === "SUBSCRIBED") {
              setStatus("live");
              setStatusMessage("Listening for new week passes in real time.");
            }
            if (
              subscribeStatus === "CHANNEL_ERROR" ||
              subscribeStatus === "TIMED_OUT"
            ) {
              setStatus("offline");
              setStatusMessage("Lost connection to the camp wall. Refresh the page.");
            }
          },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus("offline");
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the camp wall.",
        );
      }
    };

    void connect();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [password]);

  return (
    <section
      className="space-y-4 rounded-2xl border border-border bg-paper p-5 shadow-bento"
      aria-label="Live camp wall"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink">
            Live camp wall
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            New passes appear here as campers finish a week. Organizer-only —
            no camper IDs on the wall.
          </p>
        </div>
        <span
          className={[
            "inline-flex min-h-[36px] items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
            status === "live"
              ? "bg-teal-accent/15 text-teal-accent"
              : status === "connecting"
                ? "bg-purple-accent/15 text-purple-accent"
                : "bg-ink/10 text-muted-foreground",
          ].join(" ")}
        >
          {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
        </span>
      </div>

      <p className="text-sm text-ink/70">{statusMessage}</p>

      {events.length === 0 ? (
        <p className="rounded-xl bg-surface-muted px-4 py-6 text-center text-sm text-ink/70">
          {status === "live"
            ? "Waiting for the next pass…"
            : "No live events yet."}
        </p>
      ) : (
        <ul className="max-h-80 space-y-3 overflow-y-auto overscroll-contain">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
            >
              <div>
                <p className="font-display font-bold text-ink">
                  {event.first_name} {event.last_initial}. passed Week{" "}
                  {event.week_number}
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Group {event.group_letter} · {event.correct_first_try}/10 first
                  try · {event.total_points} pts
                </p>
              </div>
              <time
                className="text-xs font-semibold tabular-nums text-muted-foreground"
                dateTime={event.completed_at}
              >
                {formatWhen(event.completed_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
