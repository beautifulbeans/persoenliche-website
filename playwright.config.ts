import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const baseURL = process.env.TEA_TRAIL_URL || "http://127.0.0.1:4321";
const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export default defineConfig({
  testDir: "./tests/tea-trail",
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath:
        process.env.TEA_TRAIL_CHROME ||
        (existsSync(localChrome) ? localChrome : undefined),
      args: ["--enable-webgl", "--ignore-gpu-blocklist"],
    },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${new URL(baseURL).port}`,
    env: { ASTRO_DEV_BACKGROUND: "1" },
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
