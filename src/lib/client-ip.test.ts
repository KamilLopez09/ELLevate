import { describe, expect, it } from "vitest";
import { getClientIp } from "../../supabase/functions/_shared/client-ip";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("https://example.test", { headers });
}

describe("getClientIp", () => {
  it("prefers Cloudflare's client IP header", () => {
    const req = requestWithHeaders({
      "cf-connecting-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.99, 198.51.100.100",
    });

    expect(getClientIp(req)).toBe("203.0.113.10");
  });

  it("uses the nearest forwarded IP so spoofed leftmost values do not change the bucket", () => {
    const forwardedByGateway = "198.51.100.1";
    const firstReq = requestWithHeaders({
      "x-forwarded-for": `203.0.113.10, ${forwardedByGateway}`,
    });
    const secondReq = requestWithHeaders({
      "x-forwarded-for": `203.0.113.200, ${forwardedByGateway}`,
    });

    expect(getClientIp(firstReq)).toBe(forwardedByGateway);
    expect(getClientIp(secondReq)).toBe(forwardedByGateway);
  });

  it("ignores empty forwarded header segments", () => {
    const req = requestWithHeaders({
      "x-forwarded-for": " , 203.0.113.20, ",
    });

    expect(getClientIp(req)).toBe("203.0.113.20");
  });

  it("falls back to unknown when no IP headers are present", () => {
    expect(getClientIp(requestWithHeaders({}))).toBe("unknown");
  });
});
