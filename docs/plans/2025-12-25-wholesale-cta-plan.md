# Wholesale CTA Replacement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all retail pricing/quick-add UI in listings, featured sections, predictive search, and shoppable tooltips with a “Partner with us” CTA linking to `/pages/wholesale`. Product pages will be hidden in Shopify admin (no theme changes needed for that).

**Architecture:** Introduce a reusable `wholesale-cta` snippet that outputs a consistent button and data attribute. Use it wherever prices/quick-add buttons appear. Retarget product card and suggestion links to `/pages/wholesale`. Remove unused quick-add/product-form scripts in listing sections.

**Tech Stack:** Shopify Liquid theme, CSS (main.css), Playwright smoke tests, Theme Check.

**Constraints:** Use standard branches (no isolated worktrees) per AGENTS.md and user guidance. Create a new branch before implementation (e.g., `fix/wholesale-cta`).

---

### Task 1: Replace product card prices and quick-add with wholesale CTA

**Files:**

- Create: `snippets/wholesale-cta.liquid`
- Modify: `snippets/card.liquid`
- Modify: `assets/main.css`
- Modify: `sections/main-collection-product-grid.liquid`
- Modify: `sections/featured-collection.liquid`
- Test: `tests/smoke/wholesale-cta.spec.ts`

**Step 1: Write the failing test**

Create `tests/smoke/wholesale-cta.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('collection cards show wholesale CTA and no pricing', async ({ page }) => {
  await page.goto('/collections/all');

  const ageGate = page.locator('[data-age-gate]');
  if (await ageGate.count()) {
    await page.getByRole('button', { name: "Yes, I'm 21+" }).click();
  }

  const cards = page.locator('.card');
  await expect(cards.first()).toBeVisible();

  const wholesaleCtas = page.locator('[data-wholesale-cta]');
  await expect(wholesaleCtas.first()).toBeVisible();
  await expect(page.locator('.card__price')).toHaveCount(0);

  const wholesaleLink = page.locator('.card a').first();
  await expect(wholesaleLink).toHaveAttribute('href', '/pages/wholesale');
});
```

**Step 2: Run test to verify it fails**

Run:

```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/wholesale-cta.spec.ts
```

Expected: FAIL (CTA missing and prices present).

**Step 3: Implement minimal code to make the test pass**

Create `snippets/wholesale-cta.liquid`:

```liquid
{%- assign wholesale_url = wholesale_url | default: '/pages/wholesale' -%}
{%- assign wholesale_label = wholesale_label | default: 'Partner with us' -%}
{%- assign wholesale_class = wholesale_class | default: 'hero__button hero__button--secondary' -%}
<a class='{{ wholesale_class }} wholesale-cta' href='{{ wholesale_url }}' data-wholesale-cta>
  {{ wholesale_label }}
</a>
```

Update `snippets/card.liquid`:

- Add a local wholesale URL and use it for both card anchors.
- Replace the price blocks with the wholesale CTA.
- Remove quick-add containers to prevent add-to-cart UI.

Example changes:

```liquid
{%- assign wholesale_url = '/pages/wholesale' -%}
...
<a href="{{ wholesale_url }}" class="card...">
...
<a href="{{ wholesale_url }}" class="card...">
...
{% render 'wholesale-cta', wholesale_class: 'hero__button hero__button--secondary card__cta' %}
```

Remove these blocks entirely:

```liquid
{% if enable_quick_add_button %}
  <div class='card__quick-add-container--desktop'>
    {% render 'quick-add-button', card_product: product, product: card_product %}
  </div>
{% endif %}
```

and

```liquid
{% if enable_quick_add_button %}
  <div class='card__quick-add-container'>
    {% render 'quick-add-button', card_product: product, product: card_product %}
  </div>
{% endif %}
```

Add CTA spacing in `assets/main.css`:

```css
.card__cta {
  margin-top: calc(var(--gap, 8px) * 1.5);
}
```

Remove quick-add scripts in `sections/main-collection-product-grid.liquid` and `sections/featured-collection.liquid`:

```liquid
<script src='{{ 'product-form.js' | asset_url }}' defer='defer'></script>
<script src='{{ 'quick-add.js' | asset_url }}' defer='defer'></script>
```

and the conditional variant dropdown script block.

**Step 4: Run test to verify it passes**

Run:

```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/wholesale-cta.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add snippets/wholesale-cta.liquid snippets/card.liquid assets/main.css sections/main-collection-product-grid.liquid sections/featured-collection.liquid tests/smoke/wholesale-cta.spec.ts
git commit -m "fix: replace card pricing with wholesale cta"
```

---

### Task 2: Replace price/quick-add in predictive search, featured product, and shoppable tooltips

**Files:**

- Modify: `snippets/suggest-product-item.liquid`
- Modify: `sections/predictive-search.liquid`
- Modify: `sections/featured-product.liquid`
- Modify: `sections/shoppable-image.liquid`
- Modify: `snippets/shoppable-video-product.liquid`
- Test: `tests/smoke/wholesale-cta.spec.ts`

**Step 1: Extend the failing test (if surfaces exist)**

Add conditional assertions to `tests/smoke/wholesale-cta.spec.ts`:

```ts
const shoppablePrices = page.locator('.wt-dot__price');
await expect(shoppablePrices).toHaveCount(0);
```

**Step 2: Run test to verify it fails**

Run:

```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/wholesale-cta.spec.ts
```

Expected: FAIL if shoppable prices are present on any active page.

**Step 3: Implement minimal code to make the test pass**

`snippets/suggest-product-item.liquid`:

- Replace price block with CTA and retarget link to `/pages/wholesale`.

```liquid
<a href="/pages/wholesale" class="suggest-item">
...
{% render 'wholesale-cta', wholesale_class: 'hero__button hero__button--secondary suggest-item__cta' %}
```

`sections/predictive-search.liquid`:

- Retarget the hidden link to `/pages/wholesale` and remove price rendering in the hidden block.

`sections/featured-product.liquid`:

- Replace the `{%- when 'buy_buttons' -%}` block with the CTA snippet.

```liquid
{%- when 'buy_buttons' -%}
  <div class="wt-product__add-to-cart_form main-product__buy-buttons--container">
    {% render 'wholesale-cta', wholesale_class: 'hero__button hero__button--secondary' %}
  </div>
```

`sections/shoppable-image.liquid` and `snippets/shoppable-video-product.liquid`:

- Replace `.wt-dot__price` contents with the CTA snippet and retarget product links to `/pages/wholesale`.
- Remove/disable quick-add buttons in shoppable video:

```liquid
{%- if section.settings['quick-add-enabled'] -%}
  {# remove quick-add button output #}
{%- endif -%}
```

**Step 4: Run test to verify it passes**

Run:

```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/wholesale-cta.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add snippets/suggest-product-item.liquid sections/predictive-search.liquid sections/featured-product.liquid sections/shoppable-image.liquid snippets/shoppable-video-product.liquid tests/smoke/wholesale-cta.spec.ts
git commit -m "fix: replace retail ctas with wholesale"
```

---

### Task 3: Quality gates + documentation update

**Files:**

- Modify: `docs/wholesale-conversion/storefront-wholesale-tasklist.md`
- Test: Theme Check

**Step 1: Run Theme Check (pre-doc update)**

Run:

```
npm run theme:check
```

Expected: 0 errors.

**Step 2: Update tasklist (mark 5C complete)**

In `docs/wholesale-conversion/storefront-wholesale-tasklist.md`, mark 5C items complete and update current state notes if needed.

**Step 3: Re-run Theme Check**

Run:

```
npm run theme:check
```

Expected: 0 errors.

**Step 4: Commit**

```bash
git add docs/wholesale-conversion/storefront-wholesale-tasklist.md
git commit -m "docs: mark wholesale cta updates complete"
```

---

## Manual Verification Checklist

- `/collections/all`: no price or add-to-cart; “Partner with us” CTA visible; product card links go to `/pages/wholesale`.
- `/search?q=headspace&type=product`: cards show CTA and no price.
- Predictive search (if enabled): no price in suggestions; CTA present.
- Shoppable image/video sections (if enabled): no price or quick-add; CTA present.
- Featured product section (if present): CTA instead of buy buttons.

## Notes

- Product pages are hidden via admin (out of scope for theme).
- Optional follow-up: remove OG price meta tags in `snippets/meta-tags.liquid` if needed.
