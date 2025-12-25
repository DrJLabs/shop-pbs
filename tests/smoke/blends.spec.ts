import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('blends page renders profiles', async ({ page }) => {
  await page.goto('/pages/blends');
  await expect(page.locator('.blends-profiles__grid')).toBeVisible();
  const cards = page.locator('.blends-profiles__card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});
