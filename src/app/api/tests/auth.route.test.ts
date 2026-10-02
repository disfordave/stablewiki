import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { user: { findUnique: vi.fn(async () => null) } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
// Real bcrypt would make two dozen sign-in attempts slow
vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn(async () => false), hash: vi.fn() },
}));

import { RATE_LIMITS, resetRateLimits } from "@/server/rateLimit";
import { POST as signIn } from "../auth/signin/route";
import { POST as signUp } from "../auth/user/[[...slug]]/route";

function post(url: string, ip: string, body: object) {
  return new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  resetRateLimits();
});

describe("auth rate limits", () => {
  it("limits sign-ins per visitor, so one attacker can't lock everyone out", async () => {
    const attempt = (ip: string) =>
      signIn(
        post("http://localhost/api/auth/signin", ip, {
          username: "alice",
          password: "guess",
        }),
      );

    for (let i = 0; i < RATE_LIMITS.signIn.limit; i++) {
      expect((await attempt("203.0.113.66")).status).toBe(401);
    }
    expect((await attempt("203.0.113.66")).status).toBe(429);
    expect((await attempt("198.51.100.7")).status).toBe(401);
  });

  it("limits sign-ups, which previously had no limit at all", async () => {
    const attempt = () =>
      signUp(
        post("http://localhost/api/auth/user", "203.0.113.66", {
          username: "spammer",
          password: "password1",
          passwordConfirm: "mismatch1",
          consent: true,
        }),
      );

    for (let i = 0; i < RATE_LIMITS.signUp.limit; i++) {
      expect((await attempt()).status).toBe(400);
    }
    expect((await attempt()).status).toBe(429);
  });
});
