// Create or restore camp progress snapshots via short resume codes (Batch G1).
// COPPA: stores the same fields already kept in localStorage (first name + last initial).

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIp } from "../_shared/client-ip.ts";
import { consumeRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;
const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const CREATE_LIMIT = 5;
const CREATE_WINDOW_MS = 60 * 60 * 1000;
const RESTORE_LIMIT = 30;
const RESTORE_WINDOW_MS = 60 * 60 * 1000;

interface SnapshotCamper {
  camper_id: string;
  first_name: string;
  last_initial: string;
  age_bracket: string;
  native_language: string;
  group_letter: string;
  cumulativeScore: number;
  completedModes: string[];
}

interface CampProgressSnapshot {
  camper: SnapshotCamper;
  currentWeek?: number;
  weekPassed: Record<string, boolean>;
  lessonComplete?: boolean;
  selectedGameMode?: string | null;
  sessionStartedAt?: number;
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[bytes[i]! % CODE_CHARS.length];
  }
  return code;
}

function isString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.length >= min && value.length <= max;
}

function validateSnapshot(
  body: unknown,
): { ok: true; snapshot: CampProgressSnapshot; camperId: string } | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid snapshot" };
  }

  const record = body as Record<string, unknown>;
  const camper = record.camper;
  if (!camper || typeof camper !== "object") {
    return { ok: false, error: "Missing camper" };
  }

  const c = camper as Record<string, unknown>;
  if (
    !isString(c.camper_id, 1, 64) ||
    !isString(c.first_name, 1, 40) ||
    !isString(c.last_initial, 1, 1) ||
    !isString(c.age_bracket, 3, 5) ||
    !isString(c.native_language, 5, 10) ||
    !isString(c.group_letter, 1, 1) ||
    typeof c.cumulativeScore !== "number" ||
    !Number.isFinite(c.cumulativeScore) ||
    !Array.isArray(c.completedModes)
  ) {
    return { ok: false, error: "Invalid camper fields" };
  }

  if (c.age_bracket !== "5-9" && c.age_bracket !== "10-14") {
    return { ok: false, error: "Invalid age bracket" };
  }
  if (c.native_language !== "English" && c.native_language !== "Spanish") {
    return { ok: false, error: "Invalid language" };
  }
  if (!/^[A-Z]$/.test(c.group_letter)) {
    return { ok: false, error: "Invalid group letter" };
  }

  const weekPassed = record.weekPassed;
  if (!weekPassed || typeof weekPassed !== "object") {
    return { ok: false, error: "Missing week progress" };
  }

  const normalizedWeekPassed: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(
    weekPassed as Record<string, unknown>,
  )) {
    const weekNum = Number.parseInt(key, 10);
    if (!Number.isFinite(weekNum) || weekNum < 1 || weekNum > 8) {
      continue;
    }
    if (typeof value === "boolean") {
      normalizedWeekPassed[String(weekNum)] = value;
    }
  }

  const currentWeek = record.currentWeek;
  if (
    currentWeek !== undefined &&
    (typeof currentWeek !== "number" ||
      !Number.isInteger(currentWeek) ||
      currentWeek < 1 ||
      currentWeek > 8)
  ) {
    return { ok: false, error: "Invalid current week" };
  }

  const snapshot: CampProgressSnapshot = {
    camper: {
      camper_id: c.camper_id,
      first_name: c.first_name.trim(),
      last_initial: c.last_initial.toUpperCase(),
      age_bracket: c.age_bracket,
      native_language: c.native_language,
      group_letter: c.group_letter,
      cumulativeScore: Math.max(0, Math.floor(c.cumulativeScore)),
      completedModes: c.completedModes.filter(
        (mode): mode is string => typeof mode === "string",
      ),
    },
    weekPassed: normalizedWeekPassed,
  };

  if (currentWeek !== undefined) {
    snapshot.currentWeek = currentWeek;
  }
  if (typeof record.lessonComplete === "boolean") {
    snapshot.lessonComplete = record.lessonComplete;
  }
  if (record.selectedGameMode === null) {
    snapshot.selectedGameMode = null;
  } else if (isString(record.selectedGameMode, 1, 32)) {
    snapshot.selectedGameMode = record.selectedGameMode;
  }
  if (
    typeof record.sessionStartedAt === "number" &&
    Number.isFinite(record.sessionStartedAt)
  ) {
    snapshot.sessionStartedAt = record.sessionStartedAt;
  }

  return { ok: true, snapshot, camperId: c.camper_id };
}

function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const code = raw.trim().toUpperCase().replace(/[^2-9A-HJ-NP-Z]/g, "");
  if (code.length !== CODE_LENGTH) {
    return null;
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const action = body.action;
  const clientIp = getClientIp(req);
  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (action === "create") {
    const limited = consumeRateLimit(
      `resume-create:${clientIp}`,
      CREATE_LIMIT,
      CREATE_WINDOW_MS,
    );
    if (!limited.allowed) {
      return jsonResponse(
        { error: "Too many codes created. Try again later." },
        429,
        limited.retryAfterSeconds
          ? { "Retry-After": String(limited.retryAfterSeconds) }
          : undefined,
      );
    }

    const validated = validateSnapshot(body.snapshot);
    if (!validated.ok) {
      return jsonResponse({ error: validated.error }, 400);
    }

    const expiresAt = new Date(Date.now() + SNAPSHOT_TTL_MS).toISOString();
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const resumeCode = randomCode();
      const { error } = await admin.from("camper_resume_snapshots").insert({
        resume_code: resumeCode,
        camper_id: validated.camperId,
        snapshot: validated.snapshot,
        expires_at: expiresAt,
      });

      if (!error) {
        return jsonResponse({
          resume_code: resumeCode,
          expires_at: expiresAt,
        });
      }

      if (error.code === "23505") {
        continue;
      }
      lastError = error.message;
      break;
    }

    return jsonResponse(
      { error: lastError ?? "Could not create resume code" },
      500,
    );
  }

  if (action === "restore") {
    const limited = consumeRateLimit(
      `resume-restore:${clientIp}`,
      RESTORE_LIMIT,
      RESTORE_WINDOW_MS,
    );
    if (!limited.allowed) {
      return jsonResponse(
        { error: "Too many restore attempts. Try again later." },
        429,
        limited.retryAfterSeconds
          ? { "Retry-After": String(limited.retryAfterSeconds) }
          : undefined,
      );
    }

    const code = normalizeCode(body.code);
    if (!code) {
      return jsonResponse({ error: "Invalid resume code" }, 400);
    }

    const { data, error } = await admin
      .from("camper_resume_snapshots")
      .select("snapshot, expires_at, lookup_count")
      .eq("resume_code", code)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: "Lookup failed" }, 500);
    }

    if (!data) {
      return jsonResponse({ error: "Code not found" }, 404);
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      await admin
        .from("camper_resume_snapshots")
        .delete()
        .eq("resume_code", code);
      return jsonResponse({ error: "Code expired" }, 410);
    }

    await admin
      .from("camper_resume_snapshots")
      .update({ lookup_count: (data.lookup_count ?? 0) + 1 })
      .eq("resume_code", code);

    return jsonResponse({ snapshot: data.snapshot });
  }

  return jsonResponse({ error: "Unknown action" }, 400);
});
