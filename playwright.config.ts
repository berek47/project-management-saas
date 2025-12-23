import { defineConfig, devices } from "playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.join(__dirname, "tests"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "unit",
      testMatch: /tests\/unit\/.*\.spec\.ts/,
    },
    {
      name: "integration",
      testMatch: /tests\/integration\/.*\.spec\.ts/,
    },
    {
      name: "e2e",
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:3001",
      },
    },
  ],
});
