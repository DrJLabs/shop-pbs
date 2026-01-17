import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import settingsSchema from '../../config/settings_schema.json';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

const wholesaleSetting = settingsSchema
  .find((setting) => setting.name === 'Wholesale')
  ?.settings.find((setting) => setting.id === 'wholesale_page_url');

const wholesaleDefaultUrl = wholesaleSetting?.default ?? '/pages/wholesale';

const readJson = async (filePath: string, stripComments = false) => {
  const contents = await readFile(filePath, 'utf8');
  const normalized = stripComments ? contents.replace(/\/\*[\s\S]*?\*\//, '').trim() : contents;
  return JSON.parse(normalized);
};

const normalizeThemeUrl = (value: string) => value.replace(/^shopify:\/\//, '/');

const resolveWholesaleUrl = async () => {
  try {
    const settingsData = await readJson(
      path.join(process.cwd(), 'config', 'settings_data.json'),
      true,
    );
    const liveUrl = settingsData?.current?.wholesale_page_url;
    if (typeof liveUrl === 'string' && liveUrl.trim().length > 0) {
      return normalizeThemeUrl(liveUrl.trim());
    }
  } catch (error) {
    // Fall back to schema default if settings data is unavailable or invalid.
    console.warn(
      'Could not resolve wholesale URL from settings_data.json, falling back to default.',
      error,
    );
  }
  return normalizeThemeUrl(wholesaleDefaultUrl);
};

test('wholesale page url setting uses a valid default', () => {
  expect(wholesaleSetting).toBeTruthy();
  const allowedDefaults = new Set([undefined, '/collections', '/collections/all']);
  expect(allowedDefaults.has(wholesaleSetting?.default)).toBe(true);
});

test.describe('wholesale CTA storefront smoke checks', () => {
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
    const wholesaleUrl = await resolveWholesaleUrl();
    await expect(wholesaleLink).toHaveAttribute('href', wholesaleUrl);
  });
});

test('wholesale CTA replaces retail UI in themed templates', async () => {
  const root = process.cwd();
  const files = [
    'snippets/suggest-product-item.liquid',
    'sections/predictive-search.liquid',
    'sections/featured-product.liquid',
    'sections/shoppable-image.liquid',
    'snippets/shoppable-video-product.liquid',
    'snippets/wholesale-cta.liquid',
    'snippets/card.liquid',
  ];

  const [
    suggestItem,
    predictiveSearch,
    featuredProduct,
    shoppableImage,
    shoppableVideo,
    wholesaleCta,
    cardSnippet,
  ] = await Promise.all(files.map((file) => readFile(path.join(root, file), 'utf8')));

  const localeData = await readJson(path.join(root, 'locales/en.default.json'), true);
  const localeDir = path.join(root, 'locales');
  const localeFiles = (await readdir(localeDir)).filter(
    (file) => file.endsWith('.json') && !file.endsWith('.schema.json'),
  );
  const localeDataSets = await Promise.all(
    localeFiles.map(async (file) => ({
      file,
      data: await readJson(path.join(localeDir, file), true),
    })),
  );
  const urlNormalization = "replace: 'shopify://', '/'";

  expect(suggestItem).toContain('wholesale-cta');
  expect(suggestItem).not.toContain("render 'price'");
  expect(suggestItem).not.toContain(urlNormalization);

  expect(predictiveSearch).toContain('wholesale-cta');
  expect(predictiveSearch).not.toContain('product.url');
  expect(predictiveSearch).not.toContain("render 'price'");
  expect(predictiveSearch).toContain(urlNormalization);

  expect(featuredProduct).toContain('wholesale-cta');
  expect(featuredProduct).toContain('products.product.wholesale_pricing_request');
  expect(shoppableImage).toContain('wholesale-cta');
  expect(shoppableImage).toContain(urlNormalization);
  expect(shoppableVideo).toContain('wholesale-cta');
  expect(shoppableVideo).toContain(urlNormalization);

  expect(wholesaleCta).toContain('products.product.partner_with_us');
  expect(wholesaleCta).not.toContain('Partner with us');
  expect(wholesaleCta).toContain(urlNormalization);

  expect(cardSnippet).toContain(urlNormalization);
  expect(localeData?.products?.product?.partner_with_us).toBeTruthy();
  expect(localeData?.products?.product?.wholesale_pricing_request).toBeTruthy();
  for (const localeEntry of localeDataSets) {
    expect(localeEntry.data?.products?.product?.partner_with_us).toBeTruthy();
    expect(localeEntry.data?.products?.product?.wholesale_pricing_request).toBeTruthy();
  }
});
