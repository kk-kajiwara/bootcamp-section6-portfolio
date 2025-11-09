// section6-1-6-5_Back/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "**/*.d.ts"],
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 60,
        statements: 70,
      },
    },
  },
});
