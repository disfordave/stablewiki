import { inject } from "vitest";
import { describe, expect, it } from "vitest";
import { runPrisma } from "./database";

describe("integration database", () => {
  it("matches prisma/schema.prisma after applying every migration", async () => {
    // --exit-code makes a non-empty diff (schema drift) fail with exit code 2
    await expect(
      runPrisma(
        [
          "migrate",
          "diff",
          "--from-config-datasource",
          "--to-schema",
          "prisma/schema.prisma",
          "--exit-code",
        ],
        inject("databaseUrl"),
      ),
    ).resolves.toBeDefined();
  });
});
