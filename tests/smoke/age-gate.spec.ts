import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
    } catch (error) {
      // No-op when storage is unavailable.
    }
  });
});

test('age gate ignores focusables in aria-hidden containers', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-age-gate]')).toBeVisible();

  const dialog = page.locator('[data-age-gate] [role=\"dialog\"]');

  await page.evaluate(() => {
    const content = document.querySelector('[data-age-gate-content]');
    const confirmButton = document.querySelector('[data-age-gate-confirm]');
    if (!content || !confirmButton) return;

    content.setAttribute('aria-hidden', 'true');

    if (confirmButton instanceof HTMLElement) {
      confirmButton.focus();
    }
  });

  await page.keyboard.press('Tab');
  await expect(dialog).toBeFocused();
});

test('age gate updates aria-labelledby when locked', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-age-gate]')).toBeVisible();

  const dialog = page.locator('[data-age-gate] [role=\"dialog\"]');

  await page.locator('[data-age-gate-decline]').click();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'AgeGateLockedHeading');
  await expect(dialog).toBeFocused();
});
