import { NextRequest } from "next/server";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { TEST_JWT_SECRET, signTestToken, testUser } from "./testAuth";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), count: vi.fn(), update: vi.fn() },
    page: { update: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { PUT } from "../admin/[[...slug]]/route";

const users: Record<string, ReturnType<typeof testUser>> = {
  u_root: testUser("u_root", "root", "ADMIN"),
  u_bob: testUser("u_bob", "bob", "USER"),
};

beforeAll(() => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  prismaMock.user.findUnique.mockImplementation(
    async ({ where }: { where: { id: string } }) => users[where.id] ?? null,
  );
  prismaMock.user.count.mockResolvedValue(5);
  prismaMock.user.update.mockImplementation(
    async ({ data }: { data: object }) => ({
      id: "u_x",
      username: "x",
      role: "USER",
      status: 0,
      ...data,
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function setStatus(actorId: string, username: string, status: unknown) {
  return PUT(
    new NextRequest(`http://localhost/api/admin/users/${username}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: { Authorization: `Bearer ${await signTestToken(actorId)}` },
    }),
    { params: Promise.resolve({ slug: ["users", username] }) },
  );
}

describe("PUT /api/admin/users/:username", () => {
  it("can ban and unban users", async () => {
    expect((await setStatus("u_root", "bob", 1)).status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { username: "bob" },
        data: { status: 1 },
      }),
    );

    expect((await setStatus("u_root", "bob", 0)).status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { status: 0 } }),
    );
  });

  it("changes roles only for the documented codes", async () => {
    await setStatus("u_root", "bob", 103);
    expect(prismaMock.user.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { role: "EDITOR" } }),
    );

    // 104-108 used to fall through to ADMIN
    for (const status of [2, 100, 104, 108, 110, -1, "1", 1.5, null]) {
      const response = await setStatus("u_root", "bob", status);
      expect([status, response.status]).toEqual([status, 400]);
    }
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  });

  it("never selects password hashes for the response", async () => {
    await setStatus("u_root", "bob", 1);
    expect(prismaMock.user.update.mock.calls[0][0].select).toEqual({
      id: true,
      username: true,
      role: true,
      status: true,
    });
  });

  it("refuses self-changes and non-admin callers", async () => {
    // Demoting yourself could leave the wiki without an admin
    expect((await setStatus("u_root", "root", 101)).status).toBe(400);
    expect((await setStatus("u_bob", "alice", 1)).status).toBe(401);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown users", async () => {
    prismaMock.user.update.mockRejectedValue(
      Object.assign(new Error("not found"), { code: "P2025" }),
    );
    expect((await setStatus("u_root", "ghost", 1)).status).toBe(404);
  });
});
