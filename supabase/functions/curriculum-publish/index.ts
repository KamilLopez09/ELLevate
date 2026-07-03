// Organizer-only publish of a new active curriculum revision (Batch G4).

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIp } from "../_shared/client-ip.ts";
import {
  clearRateLimit,
  consumeRateLimit,
  incrementRateLimit,
  isRateLimited,
} from "../_shared/rate-limit.ts";
import { secureCompare } from "../_shared/secure-compare.ts";
import {
  normalizeRevisionTag,
  validateCurriculumCatalog,
} from "../_shared/curriculum-validate.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-organizer-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const PUBLISH_LIMIT = 10;
const PUBLISH_WINDOW_MS = 60 * 60 * 1000;

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

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip = getClientIp(req);
  const failKey = `organizer-fail:${ip}`;

  if (isRateLimited(failKey, FAIL_LIMIT, FAIL_WINDOW_MS).allowed === false) {
    return jsonResponse(
      { error: "Too many failed sign-in attempts. Wait 15 minutes." },
      429,
      { "Retry-After": "900" },
    );
  }

  const expectedPassword = Deno.env.get("ORGANIZER_PASSWORD");
  if (!expectedPassword) {
    return jsonResponse({ error: "Organizer access is not configured" }, 503);
  }

  const providedPassword = req.headers.get("x-organizer-password") ?? "";
  const expectedHash = await hashPassword(expectedPassword);
  const providedHash = await hashPassword(providedPassword);

  if (!secureCompare(expectedHash, providedHash)) {
    incrementRateLimit(failKey, FAIL_WINDOW_MS);
    return jsonResponse({ error: "Invalid organizer password" }, 401);
  }

  clearRateLimit(failKey);

  const publishRate = consumeRateLimit(
    `curriculum-publish:${ip}`,
    PUBLISH_LIMIT,
    PUBLISH_WINDOW_MS,
  );
  if (!publishRate.allowed) {
    return jsonResponse(
      { error: "Too many publish attempts. Try again later." },
      429,
      { "Retry-After": String(publishRate.retryAfterSeconds ?? 3600) },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const content = body.content;
  const validationError = validateCurriculumCatalog(content);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const revisionTag =
    normalizeRevisionTag(body.revision_tag) ??
    `rev-${new Date().toISOString().slice(0, 10)}`;

  const publishedBy =
    typeof body.published_by === "string"
      ? body.published_by.trim().slice(0, 120)
      : null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: inserted, error: insertError } = await admin
    .from("curriculum_revisions")
    .insert({
      revision_tag: revisionTag,
      content,
      published_by: publishedBy,
      is_active: false,
    })
    .select("id, revision_tag, published_at")
    .single();

  if (insertError || !inserted) {
    console.error("curriculum-publish insert error", insertError?.message);
    return jsonResponse({ error: "Could not publish curriculum" }, 500);
  }

  const { error: activateError } = await admin.rpc(
    "activate_curriculum_revision",
    { new_id: inserted.id },
  );

  if (activateError) {
    console.error("curriculum-publish activate error", activateError.message);
    await admin.from("curriculum_revisions").delete().eq("id", inserted.id);
    return jsonResponse({ error: "Could not publish curriculum" }, 500);
  }

  return jsonResponse({
    ok: true,
    revision_tag: inserted.revision_tag,
    published_at: inserted.published_at,
  });
});
