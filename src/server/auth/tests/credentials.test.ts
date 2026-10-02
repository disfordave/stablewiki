import bcrypt from "bcryptjs";
import * as jose from "jose";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), count: vi.fn(), create: vi.fn() },
    page: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  sessionCookieOptions,
  signInWithPassword,
} from "@/server/auth/credentials";
import { registerUser } from "@/server/auth/registration";

const SECRET = "test-secret";
let bob: Record<string, unknown>;

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  bob = {
    id: "u1",
    username: "bob",
    password: await bcrypt.hash("correct horse", 4),
    avatarUrl: null,
    role: "USER",
    createdAt: new Date(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(
    async (fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("signInWithPassword", () => {
  it("returns a verifiable token for the right password", async () => {
    prismaMock.user.findUnique.mockResolvedValue(bob);

    const result = await signInWithPassword("bob", "correct horse");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { payload } = await jose.jwtVerify(
      result.token,
      new TextEncoder().encode(SECRET),
    );
    expect(payload).toMatchObject({ id: "u1", username: "bob" });
    expect(Number(payload.exp) - Number(payload.iat)).toBe(60 * 60 * 24);
  });

  it("answers a wrong password and an unknown user the same way", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(bob)
      .mockResolvedValueOnce(null);
    const compare = vi.spyOn(bcrypt, "compare");
    const failure = {
      ok: false,
      status: 401,
      error: "Invalid username or password",
    };

    expect(await signInWithPassword("bob", "wrong")).toEqual(failure);
    expect(await signInWithPassword("nobody", "wrong")).toEqual(failure);
    // bcrypt runs for unknown users too, so timing doesn't reveal which exist
    expect(compare).toHaveBeenCalledTimes(2);
  });

  it("requires both fields", async () => {
    expect(await signInWithPassword("", "x")).toMatchObject({ status: 400 });
    expect(await signInWithPassword("bob", null)).toMatchObject({
      status: 400,
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("sessionCookieOptions", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
    }
  });

  it("is secure on https sites and expires with the token", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://wiki.example.com";
    expect(sessionCookieOptions()).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    expect(sessionCookieOptions().secure).toBe(false);
  });
});

describe("registerUser", () => {
  const valid = {
    username: "bob",
    password: "long enough",
    passwordConfirm: "long enough",
    consent: true,
  };

  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(
      async ({ data }: { data: object }) => ({
        id: "u1",
        avatarUrl: null,
        ...data,
      }),
    );
  });

  it("makes the first account an admin and keeps an existing user page", async () => {
    prismaMock.user.count.mockResolvedValue(0);

    expect(await registerUser(valid)).toMatchObject({
      ok: true,
      user: { username: "bob", role: "ADMIN" },
    });
    expect(prismaMock.page.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "User:bob" }, update: {} }),
    );
  });

  it("validates input before touching the database", async () => {
    const invalid = [
      { ...valid, passwordConfirm: "different!" },
      { ...valid, username: "Bob!" },
      { ...valid, password: "short", passwordConfirm: "short" },
      { ...valid, consent: false },
    ];
    for (const input of invalid) {
      expect(await registerUser(input)).toMatchObject({
        ok: false,
        status: 400,
      });
    }
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
