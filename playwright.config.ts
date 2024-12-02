import { defineConfig, devices, expect } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*.spec.tsx?/,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
});
