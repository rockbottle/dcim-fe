import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.tsx",
    // --- ADD THE EXCLUDE BLOCK BELOW ---
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/src/__tests__/e2e/**", // 👈 This tells Vitest to ignore your Playwright lifecycle tests
      "./playwright.config.ts", // Also ignore the Playwright config file itself
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
