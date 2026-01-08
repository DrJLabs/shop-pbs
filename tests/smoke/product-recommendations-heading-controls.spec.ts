import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('product recommendations heading controls are reflected in CSS variables', async ({ page }) => {
  const productsResponse = await page.request.get('/products.json?limit=1');
  if (!productsResponse.ok()) {
    test.skip(true, 'No product listing available for product recommendations.');
  }
  const productsPayload = await productsResponse.json();
  const handle = productsPayload?.products?.[0]?.handle;
  if (!handle) {
    test.skip(true, 'No products found for product recommendations.');
  }

  const response = await page.goto(`/products/${handle}`);
  if (!response || response.status() === 404) {
    test.skip(true, 'Product page not available for product recommendations.');
  }

  const section = page.locator('.wt-featured-collection--recommendation').first();
  if ((await section.count()) === 0) {
    test.skip(true, 'Product recommendations section is not present.');
  }

  await expect(section).toBeVisible();

  const { align, scaleDesk, scaleMobile } = await section.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      align: styles.getPropertyValue('--heading-align').trim(),
      scaleDesk: styles.getPropertyValue('--font-headline-scale-desk').trim(),
      scaleMobile: styles.getPropertyValue('--font-headline-scale').trim(),
    };
  });

  expect(align).toBe('center');
  expect(Number.parseFloat(scaleDesk)).toBeGreaterThan(0);
  expect(Number.parseFloat(scaleMobile)).toBeGreaterThan(0);

  const heading = section.locator('.headline__title').first();
  if ((await heading.count()) > 0) {
    const textAlign = await heading.evaluate((element) => {
      return window.getComputedStyle(element).textAlign;
    });
    expect(textAlign).toBe('center');
  }
});
