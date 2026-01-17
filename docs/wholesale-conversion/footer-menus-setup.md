# Footer Menus Setup

The footer now expects two Shopify navigation menus: `footer-wholesale` and `footer-policies`.

## Where to create them

- Shopify admin → Online Store → Navigation → Add menu

## Menu: `footer-wholesale` (Customer Care)

Add the following items in this order:

1. About Us — `/pages/about-us`
2. Our Process — `/pages/our-process`
3. COAs — `/pages/certificates-of-analysis-coas`
4. Wholesale — `/pages/wholesale`
5. Contact — `/pages/contact`
6. Compliance & Legal — `/pages/compliance`

## Menu: `footer-policies` (Our Policies)

Add the following items in this order:

1. Privacy Policy — `/policies/privacy-policy`
2. Terms of Service — `/policies/terms-of-service`
3. Refund Policy — `/policies/refund-policy`
4. Shipping Policy — `/policies/shipping-policy`

## Notes

- The footer config points to these handles in `sections/footer-group.json`.
- If the footer lists appear empty, the menu handles likely aren’t created yet.

## Verification

- Reload the storefront and confirm both footer columns list the expected links in order.
