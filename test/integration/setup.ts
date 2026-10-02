import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterAll, inject } from "vitest";
import { assertLocalDatabaseUrl } from "./database";

// Runs before each test file's imports, so @/lib/prisma connects here
const databaseUrl = inject("databaseUrl");
assertLocalDatabaseUrl(databaseUrl);

process.env.DATABASE_URL = databaseUrl;
process.env.DATABASE_MAX_POOL_SLOT = "5";
process.env.JWT_SECRET = "integration-test-secret";

// Media goes to a throwaway directory, never public/media
const storageDir = mkdtempSync(path.join(os.tmpdir(), "stablewiki-media-"));
delete process.env.STORAGE_DRIVER;
process.env.STORAGE_LOCAL_DIR = storageDir;

afterAll(() => {
  rmSync(storageDir, { recursive: true, force: true });
});
