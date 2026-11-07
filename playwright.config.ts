import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-344', use: { ...devices['Desktop Chrome'], isMobile: true, hasTouch: true, viewport: { width: 344, height: 780 } } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'corepack pnpm start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 120000,
  },
});
