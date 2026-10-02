import { readFile, readdir } from "fs/promises";
import path from "path";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(
  import.meta.dirname,
  "../../prisma/migrations",
);
const TARGET = "20261002120000_soft_delete_and_unique_revision_versions";

async function readMigration(name: string) {
  return readFile(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
}

describe(`migration ${TARGET}`, () => {
  let client: pg.Client;

  beforeAll(async () => {
    const serverUrl = inject("databaseServerUrl");
    const admin = new pg.Client({ connectionString: `${serverUrl}/postgres` });
    await admin.connect();
    await admin.query("DROP DATABASE IF EXISTS migration_check");
    await admin.query("CREATE DATABASE migration_check");
    await admin.end();

    client = new pg.Client({
      connectionString: `${serverUrl}/migration_check`,
    });
    await client.connect();

    const migrations = (await readdir(MIGRATIONS_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const name of migrations.filter((name) => name < TARGET)) {
      await client.query(await readMigration(name));
    }

    // Data as it could exist before this migration, including a page whose
    // concurrent edits both got version 2 under the old count + 1 numbering
    await client.query(`
      INSERT INTO "User" ("id", "username", "password", "updatedAt")
      VALUES ('u1', 'alice', 'x', now());

      INSERT INTO "Page" ("id", "title", "slug", "content", "updatedAt")
      VALUES ('raced', 'Raced', 'Raced', '', now()),
             ('clean', 'Clean', 'Clean', '', now()),
             ('empty', 'Empty', 'Empty', 'kept', now());

      INSERT INTO "Revision" ("id", "pageId", "version", "content", "createdAt")
      VALUES ('r1', 'raced', 1, 'first', '2025-01-01'),
             ('r2', 'raced', 2, 'second', '2025-01-02'),
             ('r3', 'raced', 2, 'third', '2025-01-03'),
             ('r4', 'raced', 3, 'fourth', '2025-01-04'),
             ('c1', 'clean', 1, 'clean v1', '2025-01-01'),
             ('c2', 'clean', 2, 'clean v2', '2025-01-02');
    `);

    await client.query(await readMigration(TARGET));
  });

  afterAll(async () => {
    await client?.end();
  });

  it("renumbers duplicate versions in order and leaves clean pages alone", async () => {
    const { rows } = await client.query(
      `SELECT "id", "version" FROM "Revision" ORDER BY "pageId", "version"`,
    );
    expect(rows).toEqual([
      { id: "c1", version: 1 },
      { id: "c2", version: 2 },
      { id: "r1", version: 1 },
      { id: "r2", version: 2 },
      { id: "r3", version: 3 },
      { id: "r4", version: 4 },
    ]);
  });

  it("enforces unique versions per page from now on", async () => {
    await expect(
      client.query(
        `INSERT INTO "Revision" ("id", "pageId", "version", "content") VALUES ('dup', 'clean', 2, 'x')`,
      ),
    ).rejects.toThrow(/Revision_pageId_version_key/);
  });

  it("copies each page's latest revision into Page.content", async () => {
    const { rows } = await client.query(
      `SELECT "id", "content" FROM "Page" ORDER BY "id"`,
    );
    expect(rows).toEqual([
      { id: "clean", content: "clean v2" },
      { id: "empty", content: "kept" },
      { id: "raced", content: "fourth" },
    ]);
  });

  it("replaces isSoftDeleted with deletedAt and deletedById", async () => {
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'Page' AND column_name IN ('isSoftDeleted', 'deletedAt', 'deletedById')
       ORDER BY column_name`,
    );
    expect(rows.map((row) => row.column_name)).toEqual([
      "deletedAt",
      "deletedById",
    ]);
  });
});
