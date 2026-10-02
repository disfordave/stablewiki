import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./test/stubs/server-only.ts",
      ),
    },
  },
  test: {
    include: ["**/*.int.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    globalSetup: ["./test/integration/globalSetup.ts"],
    setupFiles: ["./test/integration/setup.ts"],
    // Test files share one database, so they run one at a time
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});
