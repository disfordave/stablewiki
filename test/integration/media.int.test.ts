import { readdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/server/auth/session";
import { readMedia, uploadMedia } from "@/server/media";
import { deletePage, purgePage } from "@/server/pages";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, resetDatabase } from "./helpers";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);

let bob: SessionUser;

beforeEach(async () => {
  await resetDatabase();
  bob = await createUser("bob");
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("media", () => {
  it("stores uploads, serves them, and deletes the file on purge", async () => {
    const page = await uploadMedia(bob, {
      title: "Logo",
      file: new File([PNG], "logo.png", { type: "image/png" }),
    });
    expect(page.slug).toBe("Media:Logo.png");
    expect(await readMedia("Logo.png")).toEqual({
      body: PNG,
      contentType: "image/png",
    });

    // Trashing keeps the file so the page can be restored
    const editor = await createUser("eve", "EDITOR");
    const trashed = await deletePage(editor, "Media:Logo.png");
    expect(await readMedia("Logo.png")).not.toBeNull();

    await purgePage(await createUser("root", "ADMIN"), trashed.id);
    expect(await readMedia("Logo.png")).toBeNull();
    expect(await readdir(process.env.STORAGE_LOCAL_DIR!)).toEqual([]);
  });

  it("rejects a duplicate title without touching the stored file", async () => {
    const file = () => new File([PNG], "logo.png", { type: "image/png" });
    await uploadMedia(bob, { title: "Logo", file: file() });

    await expect(
      uploadMedia(bob, { title: "Logo", file: file() }),
    ).rejects.toMatchObject({ status: 409 });
    expect(await prisma.page.count({ where: { isMedia: true } })).toBe(1);
  });
});
