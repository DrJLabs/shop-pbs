import { chromium, FullConfig } from '@playwright/test';
import { optionalEnv, resolveShopContext } from './tests/support/shop-config';

export default async function globalSetup(_config: FullConfig) {
  const { shopOrigin, previewUrl } = resolveShopContext();
  const password = optionalEnv('SHOP_PASSWORD', ['STOREFRONT_PASSWORD']);

  if (!shopOrigin || !password) {
    console.warn('[global-setup] Missing SHOP_URL/BASE_URL or store password; skipping unlock.');
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${shopOrigin}/password`, { waitUntil: 'domcontentloaded' });
    const passwordField = page
      .locator('input#Password, input[name="password"], input[type="password"]')
      .first();

    if (await passwordField.isVisible().catch(() => false)) {
      await passwordField.fill(password);
      const submit = page
        .locator('button[name="commit"], button[type="submit"], [data-login] button, form button')
        .first();
      await Promise.all([page.waitForLoadState('domcontentloaded'), submit.click()]);
    }

    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await context.storageState({ path: 'storageState.json' });
  } finally {
    await browser.close();
  }
}
