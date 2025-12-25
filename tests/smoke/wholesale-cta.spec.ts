import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import settingsSchema from '../../config/settings_schema.json';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

const wholesaleSetting = settingsSchema
  .find((setting) => setting.name === 'Wholesale')
  ?.settings.find((setting) => setting.id === 'wholesale_page_url');

const wholesaleDefaultUrl = wholesaleSetting?.default ?? '/pages/wholesale';

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('collection cards show wholesale CTA and no pricing', async ({ page }) => {
  await page.goto('/collections/all');

  const ageGateConfirm = page.locator('[data-age-gate-confirm]');
  if (await ageGateConfirm.count()) {
    await ageGateConfirm.first().click();
  }

  const cards = page.locator('.card');
  test.skip((await cards.count()) === 0, 'No product cards found to validate.');

  await expect(cards.first()).toBeVisible();

  const wholesaleCtas = page.locator('[data-wholesale-cta]');
  await expect(wholesaleCtas.first()).toBeVisible();
  await expect(page.locator('.card__price')).toHaveCount(0);

  const wholesaleLink = page.locator('a.card').first();
  await expect(wholesaleLink).toHaveAttribute('href', wholesaleDefaultUrl);
});

test('wholesale CTA replaces retail UI in themed templates', async () => {
  const root = process.cwd();
  const files = [
    'snippets/suggest-product-item.liquid',
    'sections/predictive-search.liquid',
    'sections/featured-product.liquid',
    'sections/shoppable-image.liquid',
    'snippets/shoppable-video-product.liquid',
  ];

  const [suggestItem, predictiveSearch, featuredProduct, shoppableImage, shoppableVideo] =
    await Promise.all(files.map((file) => readFile(path.join(root, file), 'utf8')));

  expect(suggestItem).toContain("wholesale-cta");
  expect(suggestItem).not.toContain("render 'price'");

  expect(predictiveSearch).toContain("wholesale-cta");
  expect(predictiveSearch).not.toContain('product.url');
  expect(predictiveSearch).not.toContain("render 'price'");

  expect(featuredProduct).toContain("wholesale-cta");
  expect(shoppableImage).toContain("wholesale-cta");
  expect(shoppableVideo).toContain("wholesale-cta");
});
