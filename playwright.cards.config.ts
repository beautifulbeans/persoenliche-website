import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const baseURL = process.env.CARD_GAMES_URL || 'http://127.0.0.1:4340';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export default defineConfig({
  testDir: './tests/cards', testMatch: 'browser.spec.ts', timeout: 45000,
  workers: 1, reporter: 'list',
  use: { baseURL, locale: 'de-DE', viewport: { width: 1280, height: 900 }, launchOptions: { timeout: 20000, executablePath: existsSync(chrome) ? chrome : undefined } },
  webServer: { command: `npm run dev -- --host 127.0.0.1 --port ${new URL(baseURL).port}`, env: { ASTRO_DEV_BACKGROUND: '1' }, url: baseURL, reuseExistingServer: true },
});
