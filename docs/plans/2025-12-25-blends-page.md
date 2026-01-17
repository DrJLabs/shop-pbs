# Blends Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a wholesale-friendly Blends page with profile blocks that prefill from product data and expose COA links, without any purchase UI.

**Architecture:** Add a new `page.blends` template that renders `main-page` plus a custom `blends-profiles` section. The section uses block-level product pickers to pull titles, images, descriptions, and COA metafields, with manual override fields for highlights and copy. Styling lives in a dedicated CSS asset.

**Tech Stack:** Shopify Liquid, theme JSON templates, CSS, Playwright smoke tests.

### Task 1: Add blends profiles section, template, and smoke test

**Files:**

- Create: `sections/blends-profiles.liquid`
- Create: `assets/section-blends-profiles.css`
- Create: `templates/page.blends.json`
- Create: `tests/smoke/blends.spec.ts`

**Step 1: Write the failing test**

Create `tests/smoke/blends.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const baseUrlSupplied = Boolean(process.env.BASE_URL ?? process.env.SHOP_URL);

test.skip(!baseUrlSupplied, 'Set BASE_URL or SHOP_URL to run smoke checks against a live theme.');

test('blends page renders profiles', async ({ page }) => {
  await page.goto('/pages/blends');
  await expect(page.locator('.blends-profiles__grid')).toBeVisible();
  const cards = page.locator('.blends-profiles__card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:smoke -- tests/smoke/blends.spec.ts`

Expected: If `BASE_URL` or `SHOP_URL` is set, the test fails because the template/section does not exist yet (or `/pages/blends` is 404). If no URL is set, the test is skipped.

**Step 3: Write minimal implementation**

Create `assets/section-blends-profiles.css`:

```css
.blends-profiles {
  background-color: var(--color-background);
  color: var(--color-custom-text);
}

.blends-profiles__inner {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap, 8px) * 3);
}

.blends-profiles__grid {
  display: grid;
  gap: calc(var(--gap, 8px) * 3);
  grid-template-columns: repeat(var(--blends-columns-mobile, 1), minmax(0, 1fr));
}

.blends-profiles__card {
  display: grid;
  gap: calc(var(--gap, 8px) * 2);
  padding: calc(var(--gap, 8px) * 2);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
}

.blends-profiles__image {
  display: block;
  width: 100%;
  border-radius: var(--border-radius);
}

.blends-profiles__title {
  margin: 0 0 calc(var(--gap, 8px) * 1.5);
  font-family: var(--font-headline);
  font-weight: var(--font-headline-weight);
  font-style: var(--font-headline-style);
  letter-spacing: var(--font-headline-letter-spacing);
  text-transform: var(--font-headline-transform, none);
  font-size: clamp(1.6rem, 1vw + 1.2rem, 2.2rem);
  line-height: 1.2;
}

.blends-profiles__description {
  margin: 0 0 calc(var(--gap, 8px) * 1.5);
}

.blends-profiles__highlights {
  margin: 0 0 calc(var(--gap, 8px) * 2);
  padding-left: 1.2rem;
}

.blends-profiles__highlights li {
  margin-bottom: calc(var(--gap, 8px) * 0.75);
}

.blends-profiles__coa {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

@media screen and (min-width: 900px) {
  .blends-profiles__grid {
    grid-template-columns: repeat(var(--blends-columns, 2), minmax(0, 1fr));
  }

  .blends-profiles__card {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
  }
}
```

Create `sections/blends-profiles.liquid`:

```liquid
{{ 'section-blends-profiles.css' | asset_url | stylesheet_tag }}

{% assign background_rgb = section.settings.background_color | color_to_rgb %}
{% assign text_rgb = section.settings['color-body-text'] | color_to_rgb %}

<style>
  [data-section-id="{{ section.id }}"] {
    {% if section.settings.margin-top %}
      --section-gap-top: {{ section.settings.margin-top }}px;
    {% endif %}

    {% if section.settings.margin-bottom %}
      --section-gap-bottom: {{ section.settings.margin-bottom }}px;
    {% endif %}

    {% if background_rgb != 'rgba(0, 0, 0, 0.0)' %}
      --color-background: {{ section.settings.background_color }};
    {% endif %}

    {% if text_rgb != 'rgba(0, 0, 0, 0.0)' %}
      --color-custom-text: {{ section.settings['color-body-text'] }};
    {% endif %}

    --blends-columns: {{ section.settings.columns_desktop }};
    --blends-columns-mobile: {{ section.settings.columns_mobile }};
  }
</style>

<section class='blends-profiles' data-section-id='{{ section.id }}'>
  <div class='hero__wrapper blends-profiles__inner'>
    {% if section.settings.heading != blank %}
      <h2 class='headline__title blends-profiles__heading'>
        {{ section.settings.heading | escape }}
      </h2>
    {% endif %}

    {% if section.settings.intro != blank %}
      <div class='rte blends-profiles__intro'>{{ section.settings.intro }}</div>
    {% endif %}

    <div class='blends-profiles__grid'>
      {% for block in section.blocks %}
        {% assign product = block.settings.product %}
        {% assign display_title = block.settings.custom_title %}

        {% if display_title == blank and product != blank %}
          {% assign display_title = product.title %}
        {% endif %}

        {% if display_title == blank %}
          {% assign display_title = 'Blend name' %}
        {% endif %}

        {% assign description = block.settings.custom_description %}
        {% if description == blank and product != blank %}
          {% assign description = product.description | strip_html | truncatewords: 55 %}
        {% endif %}

        {% assign image = block.settings.image %}
        {% if image == blank and product != blank %}
          {% assign image = product.featured_image %}
        {% endif %}

        {% assign coa_url = block.settings.coa_url %}
        {% if coa_url == blank
          and product != blank
          and product.metafields.custom.coa_url.value != blank
        %}
          {% assign coa_url = product.metafields.custom.coa_url.value %}
        {% endif %}

        {% assign highlight_lines = block.settings.highlights | split: '\n' %}
        {% assign has_highlights = false %}
        {% for line in highlight_lines %}
          {% if line | strip != blank %}
            {% assign has_highlights = true %}
          {% endif %}
        {% endfor %}

        <article
          class='blends-profiles__card'
          data-block-id='{{ block.id }}'
          {{ block.shopify_attributes }}
        >
          <div class='blends-profiles__media'>
            {% if image != blank %}
              {{
                image
                | image_url: width: 900
                | image_tag:
                widths: '360, 540, 720, 900',
                sizes: '(min-width: 990px) 45vw, 100vw',
                alt: image.alt | escape,
                loading: 'lazy',
                class: 'blends-profiles__image'
              }}
            {% else %}
              {{
                'collection-apparel-1'
                | placeholder_svg_tag: 'blends-profiles__image blends-profiles__image--placeholder'
              }}
            {% endif %}
          </div>

          <div class='blends-profiles__content'>
            <h3 class='blends-profiles__title'>{{ display_title }}</h3>

            {% if description != blank %}
              <p class='blends-profiles__description'>{{ description }}</p>
            {% endif %}

            {% if has_highlights %}
              <ul class='blends-profiles__highlights'>
                {% for line in highlight_lines %}
                  {% assign highlight = line | strip %}
                  {% if highlight != blank %}
                    <li>{{ highlight }}</li>
                  {% endif %}
                {% endfor %}
              </ul>
            {% endif %}

            {% if coa_url != blank %}
              {% assign coa_label = block.settings.coa_label %}
              {% if coa_label == blank %}
                {% assign coa_label = 'View ' | append: display_title | append: ' COA (PDF)' %}
              {% endif %}
              <a
                class='hero__button hero__button--secondary blends-profiles__coa'
                href='{{ coa_url }}'
                target='_blank'
                rel='noopener'
              >
                {{ coa_label }}
              </a>
            {% endif %}
          </div>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Blends profiles",
  "tag": "section",
  "class": "spaced-section blends-profiles",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Our blends"
    },
    {
      "type": "richtext",
      "id": "intro",
      "label": "Intro",
      "default": "<p>Explore our current lineup and review COAs for batch-specific details.</p>"
    },
    {
      "type": "range",
      "id": "columns_desktop",
      "min": 1,
      "max": 3,
      "step": 1,
      "default": 2,
      "label": "Columns (desktop)"
    },
    {
      "type": "range",
      "id": "columns_mobile",
      "min": 1,
      "max": 2,
      "step": 1,
      "default": 1,
      "label": "Columns (mobile)"
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "color-body-text",
      "default": "transparent",
      "label": "Text color"
    },
    {
      "type": "color",
      "id": "background_color",
      "default": "transparent",
      "label": "Background color"
    },
    {
      "type": "header",
      "content": "Section spacing"
    },
    {
      "type": "range",
      "id": "margin-top",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Top spacing"
    },
    {
      "type": "range",
      "id": "margin-bottom",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Bottom spacing"
    }
  ],
  "blocks": [
    {
      "type": "blend",
      "name": "Blend",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Product"
        },
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image override"
        },
        {
          "type": "text",
          "id": "custom_title",
          "label": "Custom title"
        },
        {
          "type": "textarea",
          "id": "custom_description",
          "label": "Custom description"
        },
        {
          "type": "textarea",
          "id": "highlights",
          "label": "Highlights (one per line)",
          "default": "Cannabinoids: TBD\nTerpenes: TBD\nIntended effects: TBD"
        },
        {
          "type": "url",
          "id": "coa_url",
          "label": "COA URL override"
        },
        {
          "type": "text",
          "id": "coa_label",
          "label": "COA link label"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Blends profiles",
      "blocks": [
        {
          "type": "blend"
        }
      ]
    }
  ]
}
{% endschema %}
```

Create `templates/page.blends.json`:

```json
/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin theme editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */
{
  "sections": {
    "main": {
      "type": "main-page",
      "settings": {
        "compact-size-enabled": true,
        "size_heading": 200,
        "size_heading_mobile": 100,
        "color-body-text": "rgba(0,0,0,0)",
        "color-bg-overlay": "rgba(0,0,0,0)",
        "color-overlay-opacity": 100,
        "margin-top": 60,
        "margin-bottom": 20
      }
    },
    "blends_profiles": {
      "type": "blends-profiles",
      "blocks": {
        "blend_headspace": {
          "type": "blend",
          "settings": {
            "product": "headspace-elevate-2g"
          }
        },
        "blend_whispering": {
          "type": "blend",
          "settings": {
            "product": "whispering-roots-2g"
          }
        },
        "blend_jennaboo": {
          "type": "blend",
          "settings": {
            "product": "jennaboo-2g"
          }
        }
      },
      "block_order": ["blend_headspace", "blend_whispering", "blend_jennaboo"],
      "settings": {
        "heading": "Our blends",
        "intro": "<p>Explore our current lineup and review COAs for batch-specific details.</p>",
        "columns_desktop": 2,
        "columns_mobile": 1,
        "color-body-text": "transparent",
        "background_color": "transparent",
        "margin-top": 20,
        "margin-bottom": 60
      }
    }
  },
  "order": ["main", "blends_profiles"]
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:smoke -- tests/smoke/blends.spec.ts`

Expected: If `BASE_URL` or `SHOP_URL` is set and the `/pages/blends` page exists and uses this template, the test passes. If no URL is set, the test is skipped.

**Step 5: Commit**

```bash
git add assets/section-blends-profiles.css sections/blends-profiles.liquid templates/page.blends.json tests/smoke/blends.spec.ts
git commit -m "feat: add blends page profiles section"
```

### Task 2: Update wholesale tasklist + phase tracker docs

**Files:**

- Modify: `docs/wholesale-conversion/storefront-wholesale-tasklist.md`
- Modify: `docs/phase-tracker.md`

**Step 1: Write the failing test**

Not applicable (docs-only change).

**Step 2: Run test to verify it fails**

Not applicable.

**Step 3: Write minimal implementation**

Update `docs/wholesale-conversion/storefront-wholesale-tasklist.md`:

- Mark 5B and 5D as completed.
- Add a brief current-state note that the Blends page template and profile section exist, with COA link sourcing via `product.metafields.custom.coa_url` and manual highlight overrides.
- Note that admin must create `/pages/blends` and assign the template if not yet done.

Update `docs/phase-tracker.md`:

- Refresh the `_Last updated_` date to today and add a short note in the Phase Overview or checklist if desired to reflect the new Blends page template work.

**Step 4: Run test to verify it passes**

Run: `npm run format:check`

Expected: If this command fails due to the known `assets/settings.css` Prettier issue, record the pre-existing error and proceed. Otherwise it should pass.

**Step 5: Commit**

```bash
git add docs/wholesale-conversion/storefront-wholesale-tasklist.md docs/phase-tracker.md
git commit -m "docs: record blends page progress"
```

### Task 3: Theme check before push

**Files:**

- None (command only)

**Step 1: Write the failing test**

Not applicable.

**Step 2: Run test to verify it fails**

Not applicable.

**Step 3: Write minimal implementation**

Not applicable.

**Step 4: Run test to verify it passes**

Run: `npm run theme:check`

Expected: If it fails with known pre-existing issues, capture the output and proceed. Otherwise it should pass.

**Step 5: Commit**

Not applicable.

## Manual admin steps (outside git)

- Create a page named “Blends” with handle `blends`, assign the `page.blends` template, and verify `/pages/blends` renders.
- Update header/footer menus to point to `/pages/blends` if not already present.
- Populate highlights and COA overrides in the theme editor blocks if product metafields are incomplete.
