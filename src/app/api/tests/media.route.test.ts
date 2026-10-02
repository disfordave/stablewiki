import path from "path";
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

const { prismaMock, fsMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn() },
    page: { findUnique: vi.fn(), create: vi.fn() },
  },
  fsMock: {
    mkdir: vi.fn(async () => undefined),
    readFile: vi.fn(),
    unlink: vi.fn(async () => undefined),
    writeFile: vi.fn(async () => undefined),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("fs/promises", async (importOriginal) => ({
  ...(await importOriginal<typeof import("fs/promises")>()),
  ...fsMock,
}));

import { GET, POST } from "../media/[[...slug]]/route";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
let token: string;

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  token = await signTestToken("u_bob");
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  prismaMock.user.findUnique.mockResolvedValue(
    testUser("u_bob", "bob", "USER"),
  );
  prismaMock.page.findUnique.mockResolvedValue(null);
  prismaMock.page.create.mockImplementation(
    async ({ data }: { data: object }) => ({ id: "p1", ...data }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function get(url: string, slug?: string[]) {
  return GET(new NextRequest(url), { params: Promise.resolve({ slug }) });
}

function upload(title: string, file: File) {
  const form = new FormData();
  form.set("title", title);
  form.set("media", file);
  return POST(
    new NextRequest("http://localhost/api/media", {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${token}` },
    }),
    { params: Promise.resolve({ slug: undefined }) },
  );
}

const png = (name: string) => new File([PNG], name, { type: "image/png" });

describe("GET /api/media", () => {
  it("no longer fetches arbitrary URLs for OpenGraph images", async () => {
    // Stubbed so a regression can't make a real request from the test run
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("metadata"));
    const response = await get(
      "http://localhost/api/media?url=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data&forOpenGraph=true&noSvg=true",
    );
    expect(response.status).toBe(404);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses paths outside the media directory", async () => {
    const response = await get("http://localhost/api/media/x", [
      "..",
      "..",
      ".env",
    ]);
    expect(response.status).toBe(404);
    expect(fsMock.readFile).not.toHaveBeenCalled();
  });

  it("serves SVGs in a way that cannot run scripts", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("<svg></svg>"));
    const response = await get("http://localhost/api/media/logo.svg", [
      "logo.svg",
    ]);
    expect(response.status).toBe(200);
    expect(fsMock.readFile).toHaveBeenCalledWith(
      path.join(MEDIA_DIR, "logo.svg"),
    );
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain(
      "sandbox",
    );
  });
});

describe("POST /api/media", () => {
  it("stores a valid image inside the media directory without overwriting", async () => {
    const response = await upload("Logo", png("logo.png"));
    expect(response.status).toBe(201);
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      path.join(MEDIA_DIR, "Logo.png"),
      expect.any(Buffer),
      { flag: "wx" },
    );
    expect(prismaMock.page.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: "Media:Logo.png", isMedia: true }),
    });
  });

  it("rejects titles that would escape the media directory", async () => {
    const titles = [
      "../../src/app/page",
      "..\\..\\x",
      "/etc/cron.d/job",
      ".env",
    ];
    for (const title of titles) {
      const response = await upload(title, png("x.png"));
      expect([title, response.status]).toEqual([title, 400]);
    }
    expect(fsMock.writeFile).not.toHaveBeenCalled();
  });

  it("judges files by their content, not their claimed type", async () => {
    const html = new File(["<html><script>alert(1)</script></html>"], "a.png", {
      type: "image/png",
    });
    expect((await upload("Page", html)).status).toBe(400);
    expect(fsMock.writeFile).not.toHaveBeenCalled();
  });

  it("takes the extension from the detected type", async () => {
    expect((await upload("Shell", png("shell.php"))).status).toBe(201);
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      path.join(MEDIA_DIR, "Shell.png"),
      expect.any(Buffer),
      { flag: "wx" },
    );
  });

  it("rejects SVGs that contain scripts", async () => {
    const svg = new File(
      [
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>',
      ],
      "evil.svg",
      { type: "image/svg+xml" },
    );
    expect((await upload("Evil", svg)).status).toBe(400);
    expect(fsMock.writeFile).not.toHaveBeenCalled();
  });

  it("refuses to replace an existing file", async () => {
    prismaMock.page.findUnique.mockResolvedValue({ id: "existing" });
    expect((await upload("Logo", png("logo.png"))).status).toBe(409);
    expect(fsMock.writeFile).not.toHaveBeenCalled();

    prismaMock.page.findUnique.mockResolvedValue(null);
    fsMock.writeFile.mockRejectedValue(
      Object.assign(new Error("exists"), { code: "EEXIST" }),
    );
    expect((await upload("Logo", png("logo.png"))).status).toBe(409);
    expect(prismaMock.page.create).not.toHaveBeenCalled();
  });

  it("removes the stored file if the page cannot be created", async () => {
    prismaMock.page.create.mockRejectedValue(new Error("database down"));
    expect((await upload("Logo", png("logo.png"))).status).toBe(500);
    expect(fsMock.unlink).toHaveBeenCalledWith(
      path.join(MEDIA_DIR, "Logo.png"),
    );
  });
});
