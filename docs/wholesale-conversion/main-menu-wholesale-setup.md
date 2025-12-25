# Main Menu Wholesale Setup

This theme now expects a Shopify navigation menu handle named `main-menu-wholesale`. Create it in Shopify admin so the header renders the correct wholesale navigation.

## Where to create it
- Shopify admin → Online Store → Navigation → Add menu
- **Menu handle**: `main-menu-wholesale`

## Menu items (in order)
1. Home — `/`
2. Blends — `/pages/blends`
3. Our Process — `/pages/our-process`
4. About Us — `/pages/about-us`
5. COAs — `/pages/certificates-of-analysis-coas`
6. Wholesale — `/pages/wholesale`
7. Contact — `/pages/contact`

## Notes
- Use the exact URLs above to avoid 404s.
- The header, teaser menu, and suggestions menu all point to `main-menu-wholesale` in `sections/header-group.json`.
- If the header menu appears empty, the menu handle likely isn’t created yet.

## Verification
- Open the storefront and confirm the header displays the menu items in the order listed.
