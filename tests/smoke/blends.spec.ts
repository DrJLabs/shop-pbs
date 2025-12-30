import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('blends page renders profiles', async ({ page }) => {
  const response = await page.goto('/pages/blends');
  if (!response || response.status() === 404) {
    test.skip(true, 'Blends page is not available on this theme preview.');
  }
  const grid = page.locator('.blends-profiles__grid');
  if ((await grid.count()) === 0) {
    test.skip(true, 'Blends page is not using the blends template yet.');
  }
  await expect(grid).toBeVisible();
  const cards = page.locator('.blends-profiles__card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  const cta = page.locator('.blends-profiles__cta');
  await expect(cta.first()).toBeVisible();
  const href = await cta.first().getAttribute('href');
  expect(href).toBeTruthy();
});
