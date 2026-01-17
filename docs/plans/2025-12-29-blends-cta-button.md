# Blends per-block CTA button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an optional per-blend CTA button (label + URL) that renders above the COA link, opens in the same tab, and only appears when a URL is provided.

**Architecture:** Extend the `blends-profiles` section block schema with CTA fields, render a primary button when configured, and stack CTA/COA actions in a small wrapper. Seed CTA values in `page.blends` to keep smoke tests deterministic and provide initial admin defaults.

**Tech Stack:** Shopify Liquid, JSON templates, CSS, Playwright smoke tests.

### Task 1: Add a failing smoke test and seed CTA data

**Files:**

- Modify: `tests/smoke/blends.spec.ts`
- Modify: `templates/page.blends.json`

**Step 1: Update the smoke test to require a CTA when configured**

Update `tests/smoke/blends.spec.ts` to assert a CTA link exists on the Blends page (when the page is available and uses the blends template).

```ts
const cta = page.locator('.blends-profiles__cta');
await expect(cta.first()).toBeVisible();
const href = await cta.first().getAttribute('href');
expect(href).toBeTruthy();
```

**Step 2: Seed CTA label + URL values in the blends template**

Update `templates/page.blends.json` to add `cta_label` and `cta_url` for each blend block (use existing blend profile pages, e.g. `/pages/headspace-elevate`).

**Step 3: Run the smoke test to confirm it fails**

Run (with a local theme preview):

```bash
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/blends.spec.ts
```

Expected: FAIL with an error indicating the CTA link is missing. (If `BASE_URL` is not set, the test is skipped.)

**Step 4: Commit test + template seed**

```bash
git add tests/smoke/blends.spec.ts templates/page.blends.json
git commit -m "test: require blends CTA link"
```

### Task 2: Add CTA fields and render logic in blends profiles

**Files:**

- Modify: `sections/blends-profiles.liquid`
- Modify: `assets/section-blends-profiles.css`

**Step 1: Add CTA fields to the Blend block schema**

Add to the block settings (before COA settings):

```json
{
  "type": "text",
  "id": "cta_label",
  "label": "CTA label"
},
{
  "type": "url",
  "id": "cta_url",
  "label": "CTA link"
}
```

**Step 2: Render the CTA above the COA link**

In the card body, add logic:

```liquid
{% assign cta_url = block.settings.cta_url %}
{% assign cta_label = block.settings.cta_label | default: 'Learn more' %}

{% if cta_url != blank %}
  <a class='hero__button hero__button--primary blends-profiles__cta' href='{{ cta_url }}'>
    {{ cta_label }}
  </a>
{% endif %}
```

Wrap CTA + COA in a new `.blends-profiles__actions` container, and only render the wrapper when at least one action is present.

**Step 3: Add actions stack styling**

In `assets/section-blends-profiles.css`:

```css
.blends-profiles__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--gap, 8px) * 1.5);
}
```

**Step 4: Run formatting + theme checks**

```bash
npm run format:check
npm run theme:check
```

Expected: PASS. If Prettier fails on `assets/settings.css`, stop and request guidance (pre-existing issue).

**Step 5: Commit implementation**

```bash
git add sections/blends-profiles.liquid assets/section-blends-profiles.css
git commit -m "feat: add per-blend CTA button"
```

### Task 3: Verify CTA on the blends page

**Files:**

- None (manual QA)

**Step 1: Run smoke test again**

```bash
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/blends.spec.ts
```

Expected: PASS (CTA appears and has a link).

**Step 2: Manual QA**

- Visit `/pages/blends` in the theme preview.
- Confirm CTA appears above COA.
- Confirm CTA opens in the same tab.
- Confirm CTA is hidden when URL is blank (remove CTA URL in theme editor to verify).

## Notes

- Validate Liquid changes with `shopify-dev-mcp-full` after edits.
- Keep `page.blends` edits minimal and avoid overwriting admin-managed data beyond CTA fields.
