# Multicolumn heading size control

## Context
- The homepage multicolumn section uses the "Our Signature Blends" heading.
- The existing size sliders control column content, but the section heading does not inherit the scale.

## Decision
- Reuse the existing `size_heading` and `size_heading_mobile` range settings.
- Apply the CSS variables at the section wrapper so the headline inherits the scale.

## Implementation
- Move `--font-headline-scale-desk` and `--font-headline-scale` from `.wt-multicol` to `[data-section-id="{{ section.id }}"]`.
- Keep schema unchanged to avoid new locale keys.

## Verification
- Shopify theme validation for `sections/multicolumn.liquid`.

## Rollback
- Revert `sections/multicolumn.liquid` to reapply the scale variables only within `.wt-multicol`.
