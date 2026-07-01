// Camper telemetry write proxy.
//
// Campers no longer INSERT into camper_telemetry directly. The static client
// POSTs the session summary here; this Edge Function validates the payload
// against the same rules enforced by RLS, then inserts using the service role
// key (never exposed to the browser). Direct anon/authenticated INSERT on the
// table is revoked in migration 008.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_GAME_MODES = new Set([
  "flashcard_drill",
  "match_blitz",
  "sentence_builder",
  "rapid_fire",
]);
const ALLOWED_AGE_BRACKETS = new Set(["5-9", "10-14"]);
const ALLOWED_LANGUAGES = new Set(["English", "Spanish"]);

interface TelemetryInsert {
  module_name: "sentence_canvas";
  score: number;
  error_count: number;
  game_mode: string;
  base_points: number;
  first_try_bonus: number;
  speed_bonus: number;
  total_points: number;
  week_number: number;
  correct_first_try: number;
  cumulative_score: number;
  speed_bonuses_earned: number;
  accuracy_rate: number;
  camper_id: string;
  first_name: string;
  last_initial: string;
  age_bracket: string;
  native_language: string;
  group_letter: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function inRange(value: unknown, min: number, max: number): value is number {
  return isFiniteNumber(value) && value >= min && value <= max;
}

function isString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.length >= min && value.length <= max;
}

/** Mirrors the RLS check constraints; returns a sanitized row or an error. */
function validate(
  body: unknown,
): { ok: true; row: TelemetryInsert } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  if (b.module_name !== "sentence_canvas") {
    return { ok: false, error: "Invalid module_name" };
  }
  if (!inRange(b.score, 0, 10)) return { ok: false, error: "Invalid score" };
  if (!isFiniteNumber(b.error_count) || b.error_count < 0) {
    return { ok: false, error: "Invalid error_count" };
  }
  if (typeof b.game_mode !== "string" || !ALLOWED_GAME_MODES.has(b.game_mode)) {
    return { ok: false, error: "Invalid game_mode" };
  }
  if (!isFiniteNumber(b.base_points) || b.base_points < 0) {
    return { ok: false, error: "Invalid base_points" };
  }
  if (!isFiniteNumber(b.first_try_bonus) || b.first_try_bonus < 0) {
    return { ok: false, error: "Invalid first_try_bonus" };
  }
  if (!isFiniteNumber(b.speed_bonus) || b.speed_bonus < 0) {
    return { ok: false, error: "Invalid speed_bonus" };
  }
  if (!inRange(b.total_points, 0, 1300)) {
    return { ok: false, error: "Invalid total_points" };
  }
  if (!inRange(b.week_number, 1, 8) || !Number.isInteger(b.week_number)) {
    return { ok: false, error: "Invalid week_number" };
  }
  if (!inRange(b.correct_first_try, 0, 10)) {
    return { ok: false, error: "Invalid correct_first_try" };
  }
  if (!isFiniteNumber(b.cumulative_score) || b.cumulative_score < 0) {
    return { ok: false, error: "Invalid cumulative_score" };
  }
  if (!isFiniteNumber(b.speed_bonuses_earned) || b.speed_bonuses_earned < 0) {
    return { ok: false, error: "Invalid speed_bonuses_earned" };
  }
  if (!inRange(b.accuracy_rate, 0, 100)) {
    return { ok: false, error: "Invalid accuracy_rate" };
  }
  if (!isString(b.camper_id, 1, 64)) {
    return { ok: false, error: "Invalid camper_id" };
  }
  if (!isString(b.first_name, 1, 80)) {
    return { ok: false, error: "Invalid first_name" };
  }
  if (typeof b.last_initial !== "string" || !/^[A-Z]$/.test(b.last_initial)) {
    return { ok: false, error: "Invalid last_initial" };
  }
  if (
    typeof b.age_bracket !== "string" ||
    !ALLOWED_AGE_BRACKETS.has(b.age_bracket)
  ) {
    return { ok: false, error: "Invalid age_bracket" };
  }
  if (
    typeof b.native_language !== "string" ||
    !ALLOWED_LANGUAGES.has(b.native_language)
  ) {
    return { ok: false, error: "Invalid native_language" };
  }
  if (typeof b.group_letter !== "string" || !/^[A-Z]$/.test(b.group_letter)) {
    return { ok: false, error: "Invalid group_letter" };
  }

  // Only whitelisted fields are forwarded — prevents mass-assignment of columns.
  const row: TelemetryInsert = {
    module_name: "sentence_canvas",
    score: b.score as number,
    error_count: b.error_count as number,
    game_mode: b.game_mode as string,
    base_points: b.base_points as number,
    first_try_bonus: b.first_try_bonus as number,
    speed_bonus: b.speed_bonus as number,
    total_points: b.total_points as number,
    week_number: b.week_number as number,
    correct_first_try: b.correct_first_try as number,
    cumulative_score: b.cumulative_score as number,
    speed_bonuses_earned: b.speed_bonuses_earned as number,
    accuracy_rate: b.accuracy_rate as number,
    camper_id: b.camper_id as string,
    first_name: b.first_name as string,
    last_initial: b.last_initial as string,
    age_bracket: b.age_bracket as string,
    native_language: b.native_language as string,
    group_letter: b.group_letter as string,
  };
  return { ok: true, row };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration incomplete" }, 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const result = validate(body);
  if (!result.ok) {
    return jsonResponse({ error: result.error }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.from("camper_telemetry").insert(result.row);
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ ok: true }, 201);
});
