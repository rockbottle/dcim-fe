import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 1. Path to your E2E tests
  testDir: "./src/__tests__/e2e",

  // 2. Prevent Playwright from picking up Vitest files (.test.tsx)
  testMatch: "**/*.spec.ts",

  // 3. Run tests in serial as required by your lifecycle logic
  fullyParallel: false,
  workers: 1,

  // 4. Retry on failure (good for CI stability)
  retries: process.env.CI ? 2 : 0,

  reporter: "html",

  use: {
    // 5. The "Domain" for your goto("/") calls
    baseURL: "http://localhost:3000",

    // Collect trace on failure for debugging
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
