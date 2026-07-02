// Create or restore camp progress snapshots via short resume codes (Batch G1).
// G1.1: attestation tokens, single-use codes, bounds, generic restore errors.

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIp } from "../_shared/client-ip.ts";
import { consumeRateLimit } from "../_shared/rate-limit.ts";
import {
  issueCreateToken,
  verifyCreateToken,
} from "../_shared/resume-attestation.ts";
import {
  MAX_ACTIVE_SNAPSHOTS_PER_CAMPER,
  validateSnapshot,
} from "../_shared/resume-snapshot.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;
const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CREATE_TOKEN_TTL_MS = 15 * 60 * 1000;

const TOKEN_ISSUE_LIMIT = 10;
const TOKEN_ISSUE_WINDOW_MS = 60 * 60 * 1000;
const CREATE_LIMIT = 5;
const CREATE_WINDOW_MS = 60 * 60 * 1000;
const RESTORE_LIMIT = 30;
const RESTORE_WINDOW_MS = 60 * 60 * 1000;

const RESTORE_ERROR = "Invalid or expired code.";

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

function isCamperId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 64;
}

async function purgeExpiredSnapshots(
  admin: ReturnType<typeof createClient>,
): Promise<void> {
  await admin
    .from("camper_resume_snapshots")
    .delete()
    .lt("expires_at", new Date().toISOString());
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
  const attestationSecret = Deno.env.get("RESUME_ATTESTATION_SECRET");
  if (!supabaseUrl || !serviceRoleKey || !attestationSecret) {
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

  void purgeExpiredSnapshots(admin);

  if (action === "issue-create-token") {
    const limited = consumeRateLimit(
      `resume-token:${clientIp}`,
      TOKEN_ISSUE_LIMIT,
      TOKEN_ISSUE_WINDOW_MS,
    );
    if (!limited.allowed) {
      return jsonResponse(
        { error: "Too many requests. Try again later." },
        429,
        limited.retryAfterSeconds
          ? { "Retry-After": String(limited.retryAfterSeconds) }
          : undefined,
      );
    }

    const camperId = body.camper_id;
    const sessionStartedAt = body.session_started_at;
    if (
      !isCamperId(camperId) ||
      typeof sessionStartedAt !== "number" ||
      !Number.isFinite(sessionStartedAt) ||
      sessionStartedAt <= 0
    ) {
      return jsonResponse({ error: "Invalid session" }, 400);
    }

    const createToken = await issueCreateToken(
      attestationSecret,
      camperId,
      sessionStartedAt,
      CREATE_TOKEN_TTL_MS,
    );

    return jsonResponse({
      create_token: createToken,
      expires_at: new Date(Date.now() + CREATE_TOKEN_TTL_MS).toISOString(),
    });
  }

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

    const createToken = body.create_token;
    if (typeof createToken !== "string" || createToken.length < 10) {
      return jsonResponse({ error: "Missing create attestation" }, 401);
    }

    const validated = validateSnapshot(body.snapshot);
    if (!validated.ok) {
      return jsonResponse({ error: validated.error }, 400);
    }

    const tokenValid = await verifyCreateToken(
      attestationSecret,
      createToken,
      validated.snapshot.camper.camper_id,
      validated.snapshot.sessionStartedAt,
    );
    if (!tokenValid) {
      return jsonResponse({ error: "Invalid or expired attestation" }, 401);
    }

    const { count, error: countError } = await admin
      .from("camper_resume_snapshots")
      .select("id", { count: "exact", head: true })
      .eq("camper_id", validated.snapshot.camper.camper_id)
      .gt("expires_at", new Date().toISOString());

    if (countError) {
      return jsonResponse({ error: "Could not create resume code" }, 500);
    }
    if ((count ?? 0) >= MAX_ACTIVE_SNAPSHOTS_PER_CAMPER) {
      return jsonResponse(
        { error: "Too many active codes for this camper. Try again later." },
        429,
      );
    }

    const expiresAt = new Date(Date.now() + SNAPSHOT_TTL_MS).toISOString();
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const resumeCode = randomCode();
      const { error } = await admin.from("camper_resume_snapshots").insert({
        resume_code: resumeCode,
        camper_id: validated.snapshot.camper.camper_id,
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
      return jsonResponse({ error: RESTORE_ERROR }, 400);
    }

    const { data, error } = await admin
      .from("camper_resume_snapshots")
      .select("snapshot, expires_at")
      .eq("resume_code", code)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: RESTORE_ERROR }, 400);
    }

    if (!data || new Date(data.expires_at).getTime() < Date.now()) {
      if (data) {
        await admin.from("camper_resume_snapshots").delete().eq("resume_code", code);
      }
      return jsonResponse({ error: RESTORE_ERROR }, 400);
    }

    const validated = validateSnapshot(data.snapshot);
    if (!validated.ok) {
      await admin.from("camper_resume_snapshots").delete().eq("resume_code", code);
      return jsonResponse({ error: RESTORE_ERROR }, 400);
    }

    await admin.from("camper_resume_snapshots").delete().eq("resume_code", code);

    return jsonResponse({ snapshot: validated.snapshot });
  }

  return jsonResponse({ error: "Unknown action" }, 400);
});
