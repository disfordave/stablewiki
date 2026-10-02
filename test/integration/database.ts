import { execFile } from "child_process";
import { readFile, mkdtemp, rm, symlink } from "fs/promises";
import net from "net";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "../..");

export const TEST_DATABASE_NAME = "stablewiki_test";

// Tests truncate tables, so they must never point at a real database
export function assertLocalDatabaseUrl(url: string) {
  const { hostname } = new URL(url);
  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new Error(
      `Refusing to run integration tests against non-local database host "${hostname}"`,
    );
  }
}

// npm may skip the platform package's postinstall, which restores these links
async function hydrateEmbeddedPostgresSymlinks() {
  const packageDir = path.join(
    repoRoot,
    "node_modules",
    "@embedded-postgres",
    `${process.platform}-${process.arch}`,
  );
  const manifest = await readFile(
    path.join(packageDir, "native", "pg-symlinks.json"),
    "utf8",
  ).catch(() => "[]");

  for (const { source, target } of JSON.parse(manifest) as {
    source: string;
    target: string;
  }[]) {
    const linkPath = path.join(packageDir, target);
    const relativeSource = path.relative(
      path.dirname(linkPath),
      path.join(packageDir, source),
    );
    await symlink(relativeSource, linkPath).catch(() => undefined);
  }
}

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

export async function runPrisma(args: string[], databaseUrl: string) {
  assertLocalDatabaseUrl(databaseUrl);
  return execFileAsync("npx", ["prisma", ...args], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function startTestDatabase() {
  await hydrateEmbeddedPostgresSymlinks();
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  const databaseDir = await mkdtemp(path.join(os.tmpdir(), "stablewiki-pg-"));
  const port = await getFreePort();
  const postgres = new EmbeddedPostgres({
    databaseDir,
    port,
    user: "postgres",
    password: "postgres",
    persistent: false,
    onLog: () => undefined,
  });

  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase(TEST_DATABASE_NAME);

  const baseUrl = `postgresql://postgres:postgres@127.0.0.1:${port}`;

  return {
    baseUrl,
    url: `${baseUrl}/${TEST_DATABASE_NAME}`,
    createDatabase: (name: string) => postgres.createDatabase(name),
    stop: async () => {
      await postgres.stop();
      await rm(databaseDir, { recursive: true, force: true });
    },
  };
}
