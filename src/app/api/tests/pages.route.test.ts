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

const { prismaMock, txMock } = vi.hoisted(() => {
  const txMock = {
    $queryRaw: vi.fn(),
    revision: { aggregate: vi.fn(), create: vi.fn() },
    page: { update: vi.fn() },
    wikiLink: { deleteMany: vi.fn(), createMany: vi.fn() },
  };
  const prismaMock = {
    user: { findUnique: vi.fn() },
    page: { findUnique: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: typeof txMock) => unknown) =>
      fn(txMock),
    ),
  };
  return { prismaMock, txMock };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "../pages/[...slug]/route";

const users: Record<string, ReturnType<typeof testUser>> = {
  u_bob: testUser("u_bob", "bob", "USER"),
  u_root: testUser("u_root", "root", "ADMIN"),
};

const page = (id: string, title: string) => ({
  id,
  title,
  slug: title,
  accessLevel: 0,
  isMedia: false,
});

const pages: Record<string, ReturnType<typeof page>> = {
  "User:alice/Diary": page("p1", "User:alice/Diary"),
  WelcomePage: page("p2", "WelcomePage"),
  JavaScript: page("p3", "JavaScript"),
  "Wiki:Rules": page("p4", "Wiki:Rules"),
  TypeScript: page("p5", "TypeScript"),
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
  prismaMock.page.findUnique.mockImplementation(
    async ({ where }: { where: { slug: string } }) => pages[where.slug] ?? null,
  );
  txMock.revision.aggregate.mockResolvedValue({ _max: { version: 7 } });
  txMock.revision.create.mockImplementation(
    async ({ data }: { data: object }) => ({ id: "r1", ...data }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function edit(userId: string, slug: string, body: object) {
  return POST(
    new Request(`http://localhost/api/pages/${slug}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${await signTestToken(userId)}` },
    }),
    { params: Promise.resolve({ slug: slug.split("/") }) },
  );
}

const updatedPageData = () => txMock.page.update.mock.calls[0][0].data;

describe("POST /api/pages/[...slug]", () => {
  it("stops users from moving someone else's User page", async () => {
    const response = await edit("u_bob", "User:alice/Diary", {
      title: "Hijacked",
      content: "spam",
    });
    expect(response.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("stops users from renaming the homepage or Wiki: pages", async () => {
    const renameHome = { title: "Gone", content: "x" };
    const renameRules = { title: "Rules", content: "x" };
    expect((await edit("u_bob", "WelcomePage", renameHome)).status).toBe(403);
    expect((await edit("u_bob", "Wiki:Rules", renameRules)).status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("ignores accessLevel sent by non-admins", async () => {
    const response = await edit("u_bob", "JavaScript", {
      title: "JavaScript",
      content: "x",
      accessLevel: 9,
    });
    expect(response.status).toBe(201);
    expect(updatedPageData().accessLevel).toBeUndefined();
  });

  it("lets admins set a valid accessLevel", async () => {
    await edit("u_root", "JavaScript", {
      title: "JavaScript",
      content: "x",
      accessLevel: 9,
    });
    expect(updatedPageData().accessLevel).toBe(9);
  });

  it("numbers revisions after the highest version, inside a locked transaction", async () => {
    const response = await edit("u_bob", "JavaScript", {
      title: "JavaScript",
      content: "See [[TypeScript]]",
    });
    expect(response.status).toBe(201);
    expect(txMock.$queryRaw).toHaveBeenCalled();
    expect(txMock.revision.create.mock.calls[0][0].data.version).toBe(8);
    expect(txMock.wikiLink.createMany).toHaveBeenCalledWith({
      data: [{ sourceId: "p3", targetSlug: "TypeScript" }],
    });
  });

  it("refuses to rename onto an existing page", async () => {
    const response = await edit("u_bob", "JavaScript", {
      title: "TypeScript",
      content: "x",
    });
    expect(response.status).toBe(409);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
