import { configDefaults, defineConfig } from "vitest/config";
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
    // Integration tests need a database; run them with `npm run test:integration`
    exclude: [...configDefaults.exclude, "**/*.int.test.ts"],
  },
});
