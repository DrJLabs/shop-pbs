import { defineConfig, devices } from '@playwright/test';
import { optionalEnv, resolveShopContext } from './tests/support/shop-config';

const { baseUrl } = resolveShopContext();
const passwordPresent = Boolean(optionalEnv('SHOP_PASSWORD', ['STOREFRONT_PASSWORD']));

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './global-setup.ts',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: passwordPresent ? 'storageState.json' : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
