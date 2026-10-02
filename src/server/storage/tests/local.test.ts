import { mkdtemp, readdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLocalStorage } from "../local";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

describe("local storage", () => {
  let workDir: string;
  let mediaDir: string;

  beforeEach(async () => {
    workDir = await mkdtemp(path.join(os.tmpdir(), "stablewiki-storage-"));
    mediaDir = path.join(workDir, "media");
  });

  afterEach(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it("stores, reads and removes files", async () => {
    const storage = createLocalStorage(mediaDir);

    await storage.create("Logo.png", PNG, "image/png");
    expect(await storage.read("Logo.png")).toEqual(PNG);

    await storage.remove("Logo.png");
    expect(await storage.read("Logo.png")).toBeNull();
  });

  it("never overwrites an existing file", async () => {
    const storage = createLocalStorage(mediaDir);
    await storage.create("Logo.png", PNG, "image/png");

    await expect(
      storage.create("Logo.png", new Uint8Array([1]), "image/png"),
    ).rejects.toMatchObject({ status: 409 });
    expect(await storage.read("Logo.png")).toEqual(PNG);
  });

  it("keeps every key inside its directory", async () => {
    const storage = createLocalStorage(mediaDir);
    await writeFile(path.join(workDir, "secret.txt"), "top secret");

    for (const key of ["../secret.txt", "a/../../secret.txt", ".env", ""]) {
      expect([key, await storage.read(key)]).toEqual([key, null]);
      await expect(storage.create(key, PNG, "image/png")).rejects.toMatchObject(
        { status: 400 },
      );
    }
    expect(await readdir(workDir)).toEqual(["secret.txt"]);
  });
});
