import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const baseURL = process.env.DESIGN_REVIEW_URL || 'http://127.0.0.1:4340';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export default defineConfig({
  testDir: './tests/design',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: { baseURL, locale: 'de-AT', viewport: { width: 1440, height: 900 }, screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', launchOptions: { executablePath: existsSync(chrome) ? chrome : undefined } } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${new URL(baseURL).port}`,
    env: { ASTRO_DEV_BACKGROUND: '1' }, url: baseURL, reuseExistingServer: true,
  },
});
