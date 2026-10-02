import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimits,
} from "@/server/rateLimit";

const LIMIT = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit, then blocks", () => {
    const results = [1, 2, 3, 4].map(() =>
      checkRateLimit("signin:203.0.113.1", LIMIT),
    );
    expect(results).toEqual([true, true, true, false]);
  });

  it("counts each visitor separately", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("signin:attacker", LIMIT);
    }
    expect(checkRateLimit("signin:attacker", LIMIT)).toBe(false);
    expect(checkRateLimit("signin:someone-else", LIMIT)).toBe(true);
  });

  it("opens again once the window has passed", () => {
    for (let i = 0; i < 4; i++) {
      checkRateLimit("signin:203.0.113.1", LIMIT);
    }
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit("signin:203.0.113.1", LIMIT)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first forwarded address", () => {
    expect(
      getClientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })),
    ).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to unknown", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.8" }))).toBe(
      "203.0.113.8",
    );
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
