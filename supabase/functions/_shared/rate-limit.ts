interface RateWindow {
  count: number;
  windowStartMs: number;
}

const buckets = new Map<string, RateWindow>();
let lastPruneMs = 0;
const PRUNE_INTERVAL_MS = 60_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

function pruneStale(now: number, maxWindowMs: number): void {
  if (now - lastPruneMs < PRUNE_INTERVAL_MS) {
    return;
  }
  lastPruneMs = now;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStartMs >= maxWindowMs) {
      buckets.delete(key);
    }
  }
}

function retryAfterSeconds(
  entry: RateWindow,
  windowMs: number,
  now: number,
): number {
  return Math.max(1, Math.ceil((entry.windowStartMs + windowMs - now) / 1000));
}

/** Returns whether the key is under the limit (does not increment). */
export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  pruneStale(now, windowMs);

  const entry = buckets.get(key);
  if (!entry || now - entry.windowStartMs >= windowMs) {
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterSeconds(entry, windowMs, now),
    };
  }

  return { allowed: true };
}

/** Increments the counter for a key (starts a window if expired). */
export function incrementRateLimit(key: string, windowMs: number): void {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: now });
    return;
  }

  entry.count += 1;
}

export function clearRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Fixed-window limiter: rejects when at max, otherwise increments.
 * Use for request quotas (e.g. telemetry POSTs per IP).
 */
export function consumeRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const limited = isRateLimited(key, maxRequests, windowMs);
  if (!limited.allowed) {
    return limited;
  }
  incrementRateLimit(key, windowMs);
  return { allowed: true };
}
