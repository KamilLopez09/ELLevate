// Returns the Supabase Realtime broadcast channel for the organizer camp wall (Batch G5).
// Channel name is a server secret — only revealed after organizer password verification.

import { getClientIp } from "../_shared/client-ip.ts";
import {
  clearRateLimit,
  incrementRateLimit,
  isRateLimited,
} from "../_shared/rate-limit.ts";
import { secureCompare } from "../_shared/secure-compare.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-organizer-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

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

  try {
    const ip = getClientIp(req);
    const failKey = `organizer-wall-fail:${ip}`;

    const lockout = isRateLimited(failKey, FAIL_LIMIT, FAIL_WINDOW_MS);
    if (!lockout.allowed) {
      return jsonResponse(
        { error: "Too many failed sign-in attempts. Wait 15 minutes." },
        429,
        lockout.retryAfterSeconds
          ? { "Retry-After": String(lockout.retryAfterSeconds) }
          : { "Retry-After": "900" },
      );
    }

    const expectedPassword = Deno.env.get("ORGANIZER_PASSWORD");
    const wallChannel = Deno.env.get("CAMP_WALL_CHANNEL");

    if (!expectedPassword) {
      return jsonResponse({ error: "Organizer access is not configured" }, 503);
    }

    if (!wallChannel) {
      return jsonResponse(
        {
          enabled: false,
          error: "Camp wall is not configured on the server.",
        },
        503,
      );
    }

    const providedPassword = req.headers.get("x-organizer-password") ?? "";
    const passwordValid = await secureCompare(providedPassword, expectedPassword);
    if (!passwordValid) {
      incrementRateLimit(failKey, FAIL_WINDOW_MS);
      return jsonResponse({ error: "Invalid organizer password" }, 401);
    }

    clearRateLimit(failKey);

    return jsonResponse({
      enabled: true,
      channel: wallChannel,
    });
  } catch (error) {
    console.error("organizer-wall-session error", error);
    return jsonResponse({ error: "Could not start camp wall session" }, 500);
  }
});
