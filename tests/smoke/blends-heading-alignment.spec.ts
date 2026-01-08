import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('blends page heading defaults to center alignment', async ({ page }) => {
  const response = await page.goto('/pages/blends');
  if (!response || response.status() === 404) {
    test.skip(true, 'Blends page is not available on this theme preview.');
  }
  const heading = page.locator('.blends-profiles__heading');
  if ((await heading.count()) === 0) {
    test.skip(true, 'Blends page is not using the blends template yet.');
  }
  await expect(heading.first()).toBeVisible();
  const alignment = await heading.first().evaluate((element) => {
    return window.getComputedStyle(element).textAlign;
  });
  expect(alignment).toBe('center');
});
