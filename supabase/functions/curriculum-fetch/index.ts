// Public read of the active curriculum revision (Batch G4).

import { createClient } from "npm:@supabase/supabase-js@2";
import { getClientIp } from "../_shared/client-ip.ts";
import { consumeRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, if-none-match",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const FETCH_LIMIT = 120;
const FETCH_WINDOW_MS = 60 * 60 * 1000;

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

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip = getClientIp(req);
  const rate = consumeRateLimit(`curriculum-fetch:${ip}`, FETCH_LIMIT, FETCH_WINDOW_MS);
  if (!rate.allowed) {
    return jsonResponse(
      { error: "Too many requests. Try again later." },
      429,
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data, error } = await admin
    .from("curriculum_revisions")
    .select("revision_tag, content, published_at")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("curriculum-fetch query error", error.message);
    return jsonResponse({ error: "Could not load curriculum" }, 500);
  }

  if (!data) {
    return jsonResponse({ active: false }, 404);
  }

  const etag = `"${data.revision_tag}"`;
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ...corsHeaders,
        ETag: etag,
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return jsonResponse(
    {
      active: true,
      revision_tag: data.revision_tag,
      published_at: data.published_at,
      content: data.content,
    },
    200,
    {
      ETag: etag,
      "Cache-Control": "public, max-age=300",
    },
  );
});
