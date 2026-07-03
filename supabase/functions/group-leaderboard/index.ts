// Public, COPPA-safe group standings for campers (Batch G6).
// Returns first name + last initial only — no peer camper IDs.

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIp } from "../_shared/client-ip.ts";
import { consumeRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LEADERBOARD_LIMIT = 60;
const LEADERBOARD_WINDOW_MS = 60 * 60 * 1000;
const TOP_N = 10;

interface PublicLeaderboardEntry {
  rank: number;
  display_name: string;
  cumulative_score: number;
  weeks_passed: number;
  is_you: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidCamperId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 64 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip = getClientIp(req);
  const rate = consumeRateLimit(
    `group-leaderboard:${ip}`,
    LEADERBOARD_LIMIT,
    LEADERBOARD_WINDOW_MS,
  );
  if (!rate.allowed) {
    return jsonResponse(
      { error: "Too many requests. Try again later." },
      429,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const groupLetter =
    typeof body.group_letter === "string"
      ? body.group_letter.trim().toUpperCase()
      : "";
  const camperId = body.camper_id;

  if (!/^[A-Z]$/.test(groupLetter)) {
    return jsonResponse({ error: "Invalid group" }, 400);
  }
  if (!isValidCamperId(camperId)) {
    return jsonResponse({ error: "Invalid camper" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data, error } = await admin.rpc("get_group_leaderboard", {
    p_group_letter: groupLetter,
  });

  if (error) {
    console.error("group-leaderboard rpc error", error.message);
    return jsonResponse({ error: "Could not load standings" }, 500);
  }

  const rows = (data ?? []) as Array<{
    camper_id: string;
    first_name: string;
    last_initial: string;
    cumulative_score: number;
    weeks_passed: number;
  }>;

  const allEntries: PublicLeaderboardEntry[] = rows.map((row, index) => ({
    rank: index + 1,
    display_name: `${row.first_name} ${row.last_initial}.`,
    cumulative_score: row.cumulative_score,
    weeks_passed: Number(row.weeks_passed),
    is_you: row.camper_id === camperId,
  }));

  const yourRank =
    rows.findIndex((row) => row.camper_id === camperId) >= 0
      ? rows.findIndex((row) => row.camper_id === camperId) + 1
      : null;

  return jsonResponse({
    group_letter: groupLetter,
    entries: allEntries.slice(0, TOP_N),
    your_rank: yourRank,
    total_in_group: allEntries.length,
  });
});
