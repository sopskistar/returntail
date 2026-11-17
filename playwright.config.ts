import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
const qaURL = new URL(process.env.RETURNTAIL_QA_URL ?? 'http://localhost:3001');
if (!['localhost', '127.0.0.1'].includes(qaURL.hostname))
  throw new Error(
    'Browser fixture tests are restricted to localhost. Use the read-only production smoke script for hosted QA.',
  );
const installed =
  '/home/sopski/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.RETURNTAIL_QA_URL ?? 'http://localhost:3001',
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: existsSync(chromium.executablePath())
      ? {}
      : existsSync(installed)
        ? { executablePath: installed }
        : {},
  },
});
