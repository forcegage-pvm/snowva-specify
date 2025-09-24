import { defineConfig } from '@playwright/test';

import { VIEWPORT_PRESETS } from './cypress.config';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: Object.entries(VIEWPORT_PRESETS).map(([name, viewport]) => ({
    name,
    use: { viewport },
  })),
});
