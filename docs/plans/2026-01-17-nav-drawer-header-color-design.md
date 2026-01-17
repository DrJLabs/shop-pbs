# Nav Drawer Header Color Design

## Goal

Allow the Header section to control the nav drawer header color used by the drawer title text ("MORE") and the close icon, without changing global menu colors.

## Approach

Add a new section setting on `sections/page-header.liquid` for a drawer header text color. The setting is optional and defaults to transparent, so existing behavior is preserved. In the header section style block, define a CSS variable (`--color-drawer-title`) only when the setting is non-transparent. In the shared CSS, apply the variable to `.wt-drawer__title__text` and `.wt-drawer__close`, falling back to `var(--color-menu-text)` when no override is set. Because icons use `currentColor`, the close icon inherits the same color without modifying SVG assets.

## Files

- Update `sections/page-header.liquid` to add the setting and set `--color-drawer-title` when configured.
- Update `assets/critical.css` to apply the variable to the drawer title and close button.
- Update `locales/en.default.schema.json` to add label/info strings for the new setting.

## Testing

Manual verification in the theme editor:

- Open the nav drawer, confirm title and close icon color match the new setting.
- Leave the setting transparent and confirm the fallback matches menu text color.
