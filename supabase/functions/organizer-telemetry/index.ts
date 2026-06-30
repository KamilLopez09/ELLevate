import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-organizer-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Summary {
  totalSessions: number;
  uniqueCampers: number;
  passesByWeek: Record<string, number>;
  passesByGroup: Record<string, number>;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function buildSummary(
  rows: Array<{ camper_id: string; week_number: number; group_letter: string }>,
): Summary {
  const uniqueCampers = new Set(rows.map((row) => row.camper_id)).size;
  const passesByWeek: Record<string, number> = {};
  const passesByGroup: Record<string, number> = {};

  for (const row of rows) {
    const weekKey = String(row.week_number);
    passesByWeek[weekKey] = (passesByWeek[weekKey] ?? 0) + 1;
    passesByGroup[row.group_letter] = (passesByGroup[row.group_letter] ?? 0) + 1;
  }

  return {
    totalSessions: rows.length,
    uniqueCampers,
    passesByWeek,
    passesByGroup,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const organizerPassword = Deno.env.get("ORGANIZER_PASSWORD");
  if (!organizerPassword) {
    return jsonResponse({ error: "Organizer access is not configured" }, 503);
  }

  const providedPassword = req.headers.get("x-organizer-password");
  if (!providedPassword || providedPassword !== organizerPassword) {
    return jsonResponse({ error: "Invalid organizer password" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration incomplete" }, 503);
  }

  let limit = 500;
  try {
    const body = (await req.json()) as { limit?: number };
    if (typeof body.limit === "number" && body.limit > 0 && body.limit <= 2000) {
      limit = Math.floor(body.limit);
    }
  } catch {
    // Empty body is fine; use default limit.
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("camper_telemetry")
    .select("*")
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const rows = data ?? [];
  return jsonResponse({
    rows,
    summary: buildSummary(rows),
  });
});
