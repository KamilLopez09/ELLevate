/**
 * Best-effort client IP for Supabase Edge Functions.
 *
 * Prefer platform-set headers (harder for clients to spoof) before
 * `x-forwarded-for`, which may be client-controlled on some paths.
 */
export function getClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Proxies append to the right; spoofed client-supplied values stay left.
    const forwardedIps = forwarded
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const nearestForwardedIp = forwardedIps.at(-1);
    if (nearestForwardedIp) {
      return nearestForwardedIp;
    }
  }

  return "unknown";
}
