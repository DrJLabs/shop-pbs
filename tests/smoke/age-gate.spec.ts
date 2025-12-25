import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('age gate traps focus on non-hidden controls', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
    } catch (error) {
      // No-op when storage is unavailable.
    }
  });

  await page.goto('/');
  await expect(page.locator('[data-age-gate]')).toBeVisible();

  await page.evaluate(() => {
    const confirmButton = document.querySelector('[data-age-gate-confirm]');
    const declineButton = document.querySelector('[data-age-gate-decline]');
    if (!confirmButton || !declineButton) return;

    confirmButton.setAttribute('aria-hidden', 'false');
    declineButton.setAttribute('aria-hidden', 'true');

    if (confirmButton instanceof HTMLElement) {
      confirmButton.focus();
    }
  });

  await page.keyboard.press('Tab');

  const confirmFocused = await page.evaluate(() => {
    const active = document.activeElement;
    return Boolean(active && active.hasAttribute('data-age-gate-confirm'));
  });

  expect(confirmFocused).toBe(true);
});
