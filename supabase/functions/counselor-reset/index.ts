// Verify counselor PIN for fast device reset on shared tablets (Batch G3).
// PIN lives in Supabase secrets (COUNSELOR_RESET_PIN), never in the static bundle.

import { getClientIp } from "../_shared/client-ip.ts";
import { consumeRateLimit } from "../_shared/rate-limit.ts";
import { secureCompare } from "../_shared/secure-compare.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VERIFY_LIMIT = 8;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedPin = Deno.env.get("COUNSELOR_RESET_PIN");
  if (!expectedPin) {
    return jsonResponse({ error: "Counselor reset is not configured" }, 503);
  }

  const clientIp = getClientIp(req);
  const limited = consumeRateLimit(
    `counselor-reset:${clientIp}`,
    VERIFY_LIMIT,
    VERIFY_WINDOW_MS,
  );
  if (!limited.allowed) {
    return jsonResponse(
      { error: "Too many attempts. Try again later." },
      429,
      limited.retryAfterSeconds
        ? { "Retry-After": String(limited.retryAfterSeconds) }
        : undefined,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const pin = body.pin;
  if (typeof pin !== "string" || pin.length < 4 || pin.length > 32) {
    return jsonResponse({ ok: false }, 401);
  }

  const match = await secureCompare(pin, expectedPin);
  if (!match) {
    return jsonResponse({ ok: false }, 401);
  }

  return jsonResponse({ ok: true });
});
