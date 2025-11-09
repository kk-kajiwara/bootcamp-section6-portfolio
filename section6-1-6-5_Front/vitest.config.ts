// section6-1-6-5_Front/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/api/**", "next-env.d.ts", ".next/**"],
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
});
