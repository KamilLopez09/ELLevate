import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "../../supabase/functions/_shared/rate-limit";
import {
  RESUME_CREATE_LIMIT_PER_CAMPER,
  resumeCamperRateKey,
  resumeIpRateKey,
} from "../../supabase/functions/_shared/resume-rate-limit";

const ONE_HOUR_MS = 60 * 60 * 1000;

describe("resume rate limit keys", () => {
  it("isolates camper create quotas behind the same shared IP", () => {
    const ip = `192.0.2.${Date.now()}`;
    const firstCamperKey = resumeCamperRateKey("create", ip, "maria-g");
    const secondCamperKey = resumeCamperRateKey("create", ip, "jules-r");

    for (let i = 0; i < RESUME_CREATE_LIMIT_PER_CAMPER; i += 1) {
      expect(
        consumeRateLimit(
          firstCamperKey,
          RESUME_CREATE_LIMIT_PER_CAMPER,
          ONE_HOUR_MS,
        ).allowed,
      ).toBe(true);
    }

    expect(
      consumeRateLimit(
        firstCamperKey,
        RESUME_CREATE_LIMIT_PER_CAMPER,
        ONE_HOUR_MS,
      ).allowed,
    ).toBe(false);
    expect(
      consumeRateLimit(
        secondCamperKey,
        RESUME_CREATE_LIMIT_PER_CAMPER,
        ONE_HOUR_MS,
      ).allowed,
    ).toBe(true);
  });

  it("keeps the coarse IP guard separate from per-camper quotas", () => {
    const ip = `198.51.100.${Date.now()}`;

    expect(resumeIpRateKey("create", ip)).not.toBe(
      resumeCamperRateKey("create", ip, "maria-g"),
    );
  });
});
