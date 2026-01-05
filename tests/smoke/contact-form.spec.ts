import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('contact form fields use expected bindings', async ({ page }) => {
  const response = await page.goto('/pages/wholesale-portal');
  if (!response || response.status() === 404) {
    test.skip(true, 'Wholesale portal page is not available on this theme preview.');
  }

  const form = page.locator('form#ContactForm');
  if ((await form.count()) === 0) {
    test.skip(true, 'Contact form is not present on this page.');
  }

  const nameField = form.locator('input[name="contact[name]"]');
  const phoneField = form.locator('input[name="contact[phone]"]');
  const emailField = form.locator('input[name="contact[email]"]');
  const bodyField = form.locator('textarea[name="contact[body]"]');

  await Promise.all([
    expect(nameField).toBeVisible(),
    expect(phoneField).toBeVisible(),
    expect(emailField).toBeVisible(),
    expect(bodyField).toBeVisible(),
  ]);

  await Promise.all([
    expect(nameField).toHaveAttribute('name', 'contact[name]'),
    expect(phoneField).toHaveAttribute('name', 'contact[phone]'),
    expect(bodyField).toHaveAttribute('name', 'contact[body]'),
    expect(bodyField).not.toHaveAttribute('value'),
    expect(emailField).toHaveAttribute('type', 'email'),
    expect(emailField).toBeRequired(),
  ]);
});
