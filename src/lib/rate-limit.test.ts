import { describe, expect, it } from "vitest";
import {
  clearRateLimit,
  incrementRateLimit,
  isRateLimited,
} from "../../supabase/functions/_shared/rate-limit";

describe("rate-limit helper", () => {
  it("blocks a key after rejected requests are counted", () => {
    const key = `rejected-posts:${crypto.randomUUID()}`;
    const maxRequests = 3;
    const windowMs = 60_000;

    for (let attempt = 0; attempt < maxRequests; attempt += 1) {
      expect(isRateLimited(key, maxRequests, windowMs).allowed).toBe(true);
      incrementRateLimit(key, windowMs);
    }

    expect(isRateLimited(key, maxRequests, windowMs).allowed).toBe(false);
    clearRateLimit(key);
  });
});
