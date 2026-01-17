# Blends per-block CTA button design

## Goal

Add an optional per-blend CTA button that is controlled in the theme editor, appears above the COA link, opens in the same tab, and only renders when a URL is provided.

## Scope

- Add CTA settings to the Blend block schema in `sections/blends-profiles.liquid`.
- Render a primary CTA button above the COA link in the blend card.
- Add minimal CSS to stack action links.
- Optional: prefill CTA values for existing blocks in `templates/page.blends.json` (only if desired).

## Non-goals

- No purchase or cart UI changes.
- No changes to the `main-page` section.
- No automatic fallback to product pages for CTA links.

## Current state

- `templates/page.blends.json` renders `main-page` and `blends-profiles`.
- `sections/blends-profiles.liquid` renders per-blend cards using product data with overrides, plus a COA link.
- Styling lives in `assets/section-blends-profiles.css`.

## Proposed changes

### Schema additions (Blend block)

- `cta_label` (text): label for the new button.
- `cta_url` (url): destination for the new button.

### Rendering logic

- If `cta_url` is present, render a CTA button with `hero__button hero__button--primary blends-profiles__cta`.
- If `cta_label` is blank, fall back to "Learn more" to avoid empty buttons (assumption).
- Render the CTA above the COA link.
- Open in the same tab (no `target` or `rel`).

### Markup structure

- Keep the existing order: title, description, highlights.
- Add an actions wrapper (e.g., `blends-profiles__actions`) that contains CTA first, then COA.
- Only render the actions wrapper when at least one action is present.

### CSS

- Add `.blends-profiles__actions` as a vertical stack with a small gap and left alignment.
- No additional styling required for `.blends-profiles__cta` beyond existing button styles.

## Data flow

- Theme editor -> blend block settings -> Liquid render.
- CTA only appears when the URL is populated.

## Risks / edge cases

- CTA URL set without label -> fallback label used.
- Both CTA and COA missing -> no actions rendered.
- Existing blocks remain unchanged unless CTA values are added.

## Testing / QA

- Run `shopify theme check` after implementation.
- Manual QA on `/pages/blends`:
  - CTA appears above COA when set.
  - CTA opens in the same tab.
  - CTA hidden when URL is blank.

## Rollout

- Populate CTA fields per blend in the Theme editor (or add them to `page.blends.json` if you want them prefilled in code).
