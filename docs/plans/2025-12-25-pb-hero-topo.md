# PB Hero Topo Section Implementation Plan

**Goal:** Add a new OS 2.0 hero section (`pb-hero-topo`) with editable copy, CTAs, trust chips, and a configurable scrim over a theme-editor-selected background image.

**Architecture:** Implement a single, self-contained section file with scoped CSS and CSS variables for scrim strength, accent color, and content width. Use a `<picture>` element for desktop/mobile images, render real CTAs (disabled buttons when links are missing), and render trust chips from blocks.

**Tech Stack:** Shopify Liquid, CSS, Playwright smoke tests, tasklist documentation.

**Constraints:** Do not modify existing theme sections or templates. Use a standard branch in the current working tree (no isolated worktrees).

---

### Task 1: Add a failing smoke test for the section file

**Files:**
- Create: `tests/smoke/pb-hero-topo.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('pb hero topo section defines required schema and markup', async () => {
  const file = await readFile(path.join(process.cwd(), 'sections/pb-hero-topo.liquid'), 'utf8');

  expect(file).toContain('PB Hero - Topo');
  expect(file).toContain('pb-hero-topo');
  expect(file).toContain('<picture');
  expect(file).toContain('--pb-scrim');
  expect(file).toContain('scrim_strength');
  expect(file).toContain('content_max_width');
  expect(file).toContain('accent_color');
  expect(file).toContain('object-position: right center');
  expect(file).toContain('"type": "chip"');
  expect(file).toContain('"max_blocks": 6');
});
```

**Step 2: Run test to verify it fails**

Run:
```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/pb-hero-topo.spec.ts
```
Expected: FAIL (file missing or required strings absent).

---

### Task 2: Implement the new section file

**Files:**
- Create: `sections/pb-hero-topo.liquid`

**Step 1: Implement the section**

```liquid
{% assign desktop_image = section.settings.desktop_image %}
{% assign mobile_image = section.settings.mobile_image | default: desktop_image %}

<section
  class="pb-hero-topo"
  data-section-id="{{ section.id }}"
  data-content-align="{{ section.settings.content_align }}"
  style="
    --pb-scrim: {{ section.settings.scrim_strength | divided_by: 100.0 }};
    --pb-content-max: {{ section.settings.content_max_width }}px;
    --pb-accent: {{ section.settings.accent_color }};
  "
>
  <div class="pb-hero-topo__media" aria-hidden="true">
    {% if desktop_image != blank %}
      <picture>
        {% if mobile_image != blank %}
          <source
            media="(max-width: 749px)"
            srcset="
              {{ mobile_image | image_url: width: 750 }} 750w,
              {{ mobile_image | image_url: width: 1100 }} 1100w
            "
          >
        {% endif %}
        {{
          desktop_image
          | image_url: width: 2400
          | image_tag:
            widths: '750, 1100, 1500, 2000, 2400',
            sizes: '100vw',
            class: 'pb-hero-topo__image',
            loading: 'lazy',
            alt: desktop_image.alt | escape
        }}
      </picture>
    {% else %}
      <div class="pb-hero-topo__placeholder">
        {{ 'image' | placeholder_svg_tag: 'pb-hero-topo__placeholder-svg' }}
      </div>
    {% endif %}
  </div>

  <div class="pb-hero-topo__scrim" aria-hidden="true"></div>

  <div class="page-width pb-hero-topo__inner">
    <div class="pb-hero-topo__content">
      {% if section.settings.kicker != blank %}
        <p class="pb-hero-topo__kicker">{{ section.settings.kicker }}</p>
      {% endif %}
      {% if section.settings.heading != blank %}
        <h1 class="pb-hero-topo__heading">{{ section.settings.heading }}</h1>
      {% endif %}
      {% if section.settings.subhead != blank %}
        <p class="pb-hero-topo__subhead">{{ section.settings.subhead }}</p>
      {% endif %}

      <div class="pb-hero-topo__cta">
        {% if section.settings.primary_label != blank %}
          {% if section.settings.primary_link != blank %}
            <a class="pb-hero-topo__button pb-hero-topo__button--primary" href="{{ section.settings.primary_link }}">
              {{ section.settings.primary_label }}
            </a>
          {% else %}
            <button class="pb-hero-topo__button pb-hero-topo__button--primary" type="button" disabled aria-disabled="true">
              {{ section.settings.primary_label }}
            </button>
          {% endif %}
        {% endif %}

        {% if section.settings.secondary_label != blank %}
          {% if section.settings.secondary_link != blank %}
            <a class="pb-hero-topo__button pb-hero-topo__button--secondary" href="{{ section.settings.secondary_link }}">
              {{ section.settings.secondary_label }}
            </a>
          {% else %}
            <button class="pb-hero-topo__button pb-hero-topo__button--secondary" type="button" disabled aria-disabled="true">
              {{ section.settings.secondary_label }}
            </button>
          {% endif %}
        {% endif %}
      </div>

      {% if section.blocks.size > 0 %}
        <ul class="pb-hero-topo__chips">
          {% for block in section.blocks %}
            <li class="pb-hero-topo__chip" {{ block.shopify_attributes }}>
              {{ block.settings.label }}
            </li>
          {% endfor %}
        </ul>
      {% endif %}

      {% if section.settings.microline != blank %}
        <p class="pb-hero-topo__microline">{{ section.settings.microline }}</p>
      {% endif %}
    </div>
  </div>

  <style>
    [data-section-id="{{ section.id }}"].pb-hero-topo {
      position: relative;
      overflow: hidden;
      min-height: 420px;
      color: #ffffff;
      background-color: #0d0d0d;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__media,
    [data-section-id="{{ section.id }}"] .pb-hero-topo__scrim {
      position: absolute;
      inset: 0;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__image,
    [data-section-id="{{ section.id }}"] .pb-hero-topo__placeholder svg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: right center;
      display: block;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__scrim {
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, var(--pb-scrim)) 0%,
        rgba(0, 0, 0, 0.2) 55%,
        rgba(0, 0, 0, 0) 100%
      );
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__inner {
      position: relative;
      z-index: 2;
      margin: 0 auto;
      padding: 80px 24px;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__content {
      max-width: var(--pb-content-max);
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
      align-items: flex-start;
    }
    [data-section-id="{{ section.id }}"][data-content-align="center"] .pb-hero-topo__content {
      text-align: center;
      align-items: center;
      margin-left: auto;
      margin-right: auto;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__kicker {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.85rem;
      margin: 0;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__heading {
      font-size: clamp(2.2rem, 4vw, 3.6rem);
      margin: 0;
      line-height: 1.1;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__subhead {
      font-size: 1.05rem;
      margin: 0;
      max-width: 38rem;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__cta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__button {
      font: inherit;
      padding: 12px 22px;
      border-radius: 999px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__button--primary {
      background: var(--pb-accent);
      color: #ffffff;
      border-color: var(--pb-accent);
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__button--secondary {
      background: transparent;
      color: #ffffff;
      border-color: #ffffff;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__chips {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__chip {
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      font-size: 0.85rem;
    }
    [data-section-id="{{ section.id }}"] .pb-hero-topo__microline {
      font-size: 0.85rem;
      opacity: 0.8;
      margin: 0;
    }
    @media (max-width: 749px) {
      [data-section-id="{{ section.id }}"] .pb-hero-topo__inner {
        padding: 56px 20px;
      }
      [data-section-id="{{ section.id }}"] .pb-hero-topo__cta {
        flex-direction: column;
        align-items: stretch;
      }
    }
  </style>

  {% schema %}
  {
    "name": "PB Hero - Topo",
    "tag": "section",
    "class": "pb-hero-topo-section",
    "settings": [
      { "type": "image_picker", "id": "desktop_image", "label": "Desktop image" },
      { "type": "image_picker", "id": "mobile_image", "label": "Mobile image" },
      { "type": "text", "id": "kicker", "label": "Kicker", "default": "DrJ's Premium Blends" },
      {
        "type": "text",
        "id": "heading",
        "label": "Heading",
        "default": "Pharmacist-crafted blends. Built on transparency."
      },
      {
        "type": "textarea",
        "id": "subhead",
        "label": "Subhead",
        "default": "Hemp-derived cannabinoid blends with COAs for every batch—rooted in East Tennessee."
      },
      { "type": "text", "id": "primary_label", "label": "Primary label", "default": "View COAs" },
      { "type": "url", "id": "primary_link", "label": "Primary link" },
      { "type": "text", "id": "secondary_label", "label": "Secondary label", "default": "Our Process" },
      { "type": "url", "id": "secondary_link", "label": "Secondary link" },
      {
        "type": "text",
        "id": "microline",
        "label": "Microline",
        "default": "For adults 21+. Hemp-derived products. Results may vary."
      },
      {
        "type": "range",
        "id": "scrim_strength",
        "label": "Scrim strength",
        "min": 0,
        "max": 100,
        "step": 5,
        "default": 75
      },
      {
        "type": "range",
        "id": "content_max_width",
        "label": "Content max width",
        "min": 420,
        "max": 820,
        "step": 20,
        "default": 720
      },
      {
        "type": "select",
        "id": "content_align",
        "label": "Content alignment",
        "default": "left",
        "options": [
          { "value": "left", "label": "Left" },
          { "value": "center", "label": "Center" }
        ]
      },
      {
        "type": "color",
        "id": "accent_color",
        "label": "Accent color",
        "default": "#5b894d"
      }
    ],
    "blocks": [
      {
        "type": "chip",
        "name": "Trust chip",
        "settings": [
          { "type": "text", "id": "label", "label": "Label", "default": "COAs for every batch" }
        ]
      }
    ],
    "max_blocks": 6,
    "presets": [
      {
        "name": "PB Hero - Topo",
        "blocks": [
          { "type": "chip", "settings": { "label": "COAs for every batch" } },
          { "type": "chip", "settings": { "label": "Pharmacist-crafted" } },
          { "type": "chip", "settings": { "label": "Hemp-derived" } },
          { "type": "chip", "settings": { "label": "21+ only" } }
        ]
      }
    ]
  }
  {% endschema %}
```

**Step 2: Run test to verify it passes**

Run:
```
BASE_URL=http://127.0.0.1:9292 npm run test:smoke -- tests/smoke/pb-hero-topo.spec.ts
```
Expected: PASS.

**Step 3: Commit**

```bash
git add sections/pb-hero-topo.liquid tests/smoke/pb-hero-topo.spec.ts
git commit -m "feat: add pb hero topo section"
```

---

### Task 3: Update documentation + task list

**Files:**
- Modify: `docs/wholesale-conversion/storefront-wholesale-tasklist.md`
- Modify: `docs/plans/2025-12-25-pb-hero-topo-design.md`

**Step 1: Update task list**
- Under **1D Create the hero section**, add a completed bullet noting the new OS 2.0 hero section file exists and can be added to the homepage in the Theme Editor.
- Update the current state note to mention the new section is available but not yet placed.

**Step 2: Confirm design doc reflects final behavior**
- Ensure the design doc matches the disabled-button behavior for blank links.

**Step 3: Commit**

```bash
git add docs/wholesale-conversion/storefront-wholesale-tasklist.md docs/plans/2025-12-25-pb-hero-topo-design.md
git commit -m "docs: add pb hero topo notes"
```

---

## Manual Verification Checklist

- Section appears in Theme Editor as “PB Hero - Topo”.
- Background image is selectable and swappable in Admin.
- Buttons show and link correctly when URLs are set; blank URLs render disabled buttons.
- Chips render and are editable as blocks (max 6).
- Mobile CTA buttons stack.
- Scrim strength slider changes overlay intensity.
