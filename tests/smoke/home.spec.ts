import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('homepage renders primary sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  const primaryRegion = page.locator('[data-section-id], header, main').first();
  await expect(primaryRegion).toBeVisible();
});
