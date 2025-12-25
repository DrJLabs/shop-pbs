# Storefront Inventory + Completion Checklist (Working Doc)

## Table of Contents |
- 0 Executive snapshot
- 1 Home page redesign
- 2 Site navigation and structure
- 3 About Us page creation
- 4 Our Process page refinement
- 5 Blends page development
- 6 COAs page improvement
- 7 Compliance &amp; Legal page creation
- 8 Wholesale information page
- 9 Contact page refinement
- 10 Accessibility and SEO improvements
- 11 Technical cleanup and theme settings
- 12 Final review and next steps
- Appendix

# 0 Executive snapshot

- Existing pages (public today)
- Missing pages (404s / not created)
- Admin-only items (requires Shopify admin access)
- Other observations (header/footer behaviors)

- Current state: Publicly accessible pages today include the home page (`/`), Our Shop collection page (`/collections/all`), and individual product pages for Headspace Elevate, JennaBoo, and Whispering Roots (each showing price, flavour variants, and an Add to cart button). There is also an Our Process page (`/pages/our-process`) describing sourcing, formulation, testing, and packaging; a contact page (`/pages/contact`) with a multi-field form; a FAQs page (`/pages/faqs`); a Certificates of Analysis (COAs) page (`/pages/certificates-of-analysis-coas`) linking to PDF COAs; and Shopify policy pages (privacy policy, refund policy, shipping policy, terms of service). There is also a data-sharing opt-out page (`/pages/data-sharing-opt-out`) and a Track Order page implemented via the Track123 app (`/apps/track123`).
- Current state: The planned About Us page (`/pages/about-us`) and a combined Shipping &amp; Returns page both return a 404 (“OPS! We can’t find what you’re looking for here”) with a “Back to home” button. There is currently no Wholesale page. The Compliance &amp; Legal link loads a page that contains only the standard footer—no legal or compliance content is provided. The Our Shop menu item still points to a retail collection page showing prices.
- Current state: Without Shopify admin access we cannot verify hidden draft pages, theme section names/settings (e.g., header section names), or toggle cart/search icons. We note where admin confirmation may be needed.
- Current state: The header shows the logo, “Home / Our Shop / Contact Us” links plus search, account, and cart icons. Pages include announcement bar repeating “Expertly crafted blends for a • refined experience”. Most pages end with a four-column footer listing Customer Care links (About Us, Contact Us, Shipping &amp; Returns, Compliance &amp; Legal, FAQs, Track Order, Your privacy choices, COAs / Lab Reports, Our Process), policy links (Privacy, Refund, Shipping, Terms of Service), and a newsletter subscription form (“Be the first to know the latest releases, news, collaborations, exclusives and offers!”). Payment icons (PayPal and Venmo) appear. A second subscribe form labelled “SUBSCRIBE TO OUR EMAILS” also appears near the bottom of the home page.

# 1 Home page redesign

- [ ] Restructure the home page to remove retail functionality and reposition it as a brand hub.
- Current state: The home page is currently retail-oriented with product pricing, Add to cart buttons, a cart icon, and generic e-commerce promos.

## 1A Plan the structure and remove retail elements

- [ ] Identify all current home page sections (hero banner, product grid, promotional features, newsletter form, footer).
- Current state: Home opens with hero (Tennessee outline + Dr Js logo overlay, tagline, two CTAs). Below: “Shop our blends” product grid (3 products with price and Add to cart). Further down: four promo icons (Fast shipping, Regular sales, Easy returns, Secure checkout). Then newsletter (“SUBSCRIBE TO OUR EMAILS”). Ends with standard four-column footer.

## 1B Disable or delete retail product grid elements

- [x] Disable or delete the existing product grid (“Shop our blends”).
- [x] Remove any “Add to cart” elements.
- [x] Remove pricing displays.
- [x] Remove discount banners (if any).
- Current state: Product grid removed from the home page; no Add to cart elements or pricing display in the main content.

## 1C Remove cart/account/search entry points in the header (COMPLETED)

- [x] Remove header search entry point (icon + form/drawer).
- [x] Remove account/login icon link.
- [x] Remove cart/bag icon link.
- Current state: Completed in theme. `sections/page-header.liquid` no longer renders `search-drawer` or account/cart header panel items. The “Log in” menu link remains in the header per request.

**Acceptance Criteria**
- Header shows no search, account, or cart icons/links on desktop or mobile.
- No `search-drawer` or `.wt-header__search__body` nodes in the header DOM.
- Keyboard tabbing across the header does not land on search/account/cart controls.
- Navigation/logo/menu toggle still work.

**Verification**
- Run `shopify theme dev --store <store-domain> --theme <theme_id>` and visit `http://127.0.0.1:9292`.
- Confirm selectors are absent: `.wt-header__panel__item--account`, `.wt-header__panel__item--cart`, `.wt-header__search-trigger`, `.wt-header__search__body`, `search-drawer`.
- Manual tab-through on desktop and mobile emulator.

## 1D Create the hero section

- [ ] Select or design a high-quality hero image that reflects the brand (e.g., scenic Tennessee landscape, hemp leaves, Dr Js logo).
- [x] Overlay the tagline “Expertly crafted blends for a refined experience” (or update it if needed).
- [x] Add CTA button: “Discover our blends” (link to Blends page).
- [x] Add CTA button: “Partner with us (wholesale)” (link to wholesale overview).
- Current state: Hero uses dark background + Tennessee outline + Dr Js logo; tagline appears in white; CTAs are Discover our blends (`/pages/blends`) and Partner with us (wholesale) (`/pages/wholesale`). Hero image remains unchanged (placeholder). New OS 2.0 section `pb-hero-topo` exists with editable copy/CTAs/chips and background image settings but is not yet placed on the homepage (index.json unchanged).

**Acceptance Criteria**
- Hero image is updated to an approved brand visual with descriptive alt text.
- Tagline text matches approved copy and remains legible on desktop and mobile.
- CTA 1 links to the Blends page (`/pages/blends` or final chosen URL).
- CTA 2 links to Wholesale page (`/pages/wholesale` or final chosen URL).
- No hero CTA links to retail collections or cart flows.

**Verification**
- Load `/` on desktop and mobile widths; verify CTA labels and targets.
- Confirm alt text exists for the hero image.

## 1E Add a brand story section

- [x] Insert a brand story section below the hero.
- [x] Write a concise paragraph (3–4 sentences) summarising the founding story, mission, and values.
- [x] Pair the story with an image or graphic.
- Current state: Brand story section is in place below the hero with placeholder copy and a temporary image (reusing the hero image). Image is positioned on the right; copy will be refined later.

**Acceptance Criteria**
- Brand story section appears immediately below the hero.
- Copy includes origin, mission, and brand values in 3–4 sentences.
- Supporting image/graphic has alt text and does not overpower the copy.

**Verification**
- Check `/` on desktop and mobile for layout spacing and readability.

## 1F Present unique selling points (USPs)

- [x] Create short phrases and icons for 3–4 differentiators (e.g., pharmacist-led formulation, premium hemp sourcing, third-party testing, terpene-rich profiles).
- Current state: The home page now uses placeholder brand USPs with built-in icons; copy is ready to refine.

**Acceptance Criteria**
- 3–4 USPs are present with consistent icon style and concise copy.
- USP copy is brand-specific (not retail-ops focused).
- Icons have alt text or are decorative with `aria-hidden`.

**Verification**
- Visually inspect `/` on desktop/mobile.
- Spot-check icon accessibility attributes.

## 1G Include a process overview teaser

- [x] Add a process overview teaser section on the home page.
- [x] Summarise each step (Sourcing, Formulation, Testing, Packaging & Delivery) with 1–2 sentences each.
- [x] Add icons for each step.
- [x] Link to the full “Our Process” page.
- Current state: A four-step process teaser with placeholder copy and a CTA to `/pages/our-process` now appears on the home page.

**Acceptance Criteria**
- Process teaser includes all four steps with short summaries.
- Each step has a consistent icon treatment.
- A clear CTA links to `/pages/our-process`.

**Verification**
- Click CTA to confirm it routes to the process page.
- Check layout on mobile (no overflow or stacking issues).

## 1H Remove retail promotional features

- [x] Remove retail promotional features (Fast Shipping, Regular Sales, Easy Returns, etc.) from the home page.
- [x] Replace with a newsletter sign-up (or remove entirely if not desired).
- Current state: Retail promo block has been replaced by brand USPs, and the homepage now uses the USP section instead of retail promos.

**Acceptance Criteria**
- Retail promo block is removed from the home page.
- Replacement section (newsletter or brand-oriented block) matches brand tone.

**Verification**
- Review `/` to confirm the retail promo block is no longer visible.

## 1I Update the newsletter sign-up (SKIPPED)

- [ ] Keep a clean email capture form titled “Stay in the loop”. (Skipped by request)
- [ ] Update newsletter microcopy to set expectations (e.g., “Get updates on new blends and industry news”). (Skipped by request)
- Current state: Skipped by request; newsletter block remains unchanged (“SUBSCRIBE TO OUR EMAILS” and “new collections and exclusive offers”).

**Acceptance Criteria**
- Newsletter heading and microcopy match wholesale/brand tone (no retail promo language).
- Form still submits successfully.

**Verification**
- Submit a test email and confirm success message.

## 1J Edit the footer

- [x] Remove payment logos.
- [x] Remove retail-specific links (Shipping & Returns, Track Order).
- [x] Add navigation items: About Us, Our Process, COAs, Wholesale, Contact.
- [x] Ensure the copyright year updates automatically.
- Current state: Footer uses `footer-wholesale` and `footer-policies` menus populated in admin, payment icons are disabled, and copyright is rendered dynamically.

**Acceptance Criteria**
- Footer no longer shows payment logos.
- Footer links exclude retail-only pages and include About Us, Our Process, COAs, Wholesale, Contact.
- Copyright year is dynamic (or updated to current year).

**Verification**
- Verify footer links open valid pages (no 404s).

## 1K Implement age verification (21+)

- [ ] Choose an app or theme setting to display an age-verification modal.
- [ ] Ensure the age gate does not reappear after confirmation.
- Current state: No age-verification pop-up or modal exists.

**Acceptance Criteria**
- Age gate appears on first visit and blocks interaction until confirmed.
- Once confirmed, the gate does not reappear on subsequent pages in the same session.

**Verification**
- Test in a fresh private window and on a second page load.

## Inventory Notes

- Current state: The home page still functions as a retail storefront (pricing, Add to cart buttons, retail CTAs). Brand story, USPs, process teaser, and wholesale CTA are now in place.

# 2 Site navigation and structure

## 2A Update the main menu

- [x] Remove retail items (“Our Shop”).
- [x] Add or reorder menu items to: Home, Blends, Our Process, About Us, COAs, Wholesale, Contact.
- Current state: `main-menu-wholesale` is populated in admin and verified in the header.

**Acceptance Criteria**
- Main menu contains only the listed items, in the approved order.
- Menu links route to live pages (no 404s).

**Verification**
- Click each menu item on desktop and mobile.

## 2B Create or update secondary menus (footer)

- [x] Include only relevant links: About, Contact, COAs, Our Process, Compliance & Legal, Privacy Policy, Terms of Service.
- [x] Remove unnecessary retail support links.
- [x] Remove payment icons.
- Current state: `footer-wholesale` and `footer-policies` are populated in admin; payment icons remain disabled and menus render correctly.

**Acceptance Criteria**
- Footer contains only approved links and excludes retail-only items.
- Payment icons are removed.

**Verification**
- Verify footer link targets and absence of payment icons.

## 2C Ensure menu responsiveness

- [x] Test the menu on mobile.
- [x] Adjust spacing, font sizes, and colours as needed.
- Current state: Verified via Playwright at 375px and 768px; no overflow or spacing issues observed.

**Acceptance Criteria**
- Mobile menu is readable, tappable, and does not overflow.
- Menu items are consistent with desktop navigation.

**Verification**
- Test on common breakpoints (375px, 768px).

## Inventory Notes

- Current state: Navigation leads to retail pages (Our Shop and Track Order app). Missing menu entries limit discoverability of About, Blends, COAs, and Wholesale.

# 3 About Us page creation

## 3A Draft About Us content

- [ ] Draft content covering origin story.
- [ ] Draft mission and values.
- [ ] Introduce founders/team.
- [ ] Avoid awards/certifications.
- Current state: No About Us page exists; `/pages/about-us` returns 404.

**Acceptance Criteria**
- Copy includes origin story, mission/values, and founder/team introduction.
- Tone is brand-aligned and compliant (no unverified claims).

**Verification**
- Review copy with stakeholders before publishing.

## 3B Design the page using Shopify sections

- [ ] Design “Our Story” section.
- [ ] Design “Mission & Values” section.
- [ ] Design “Meet the Founder/Team” section.
- [ ] Choose fonts and colours that match site branding.
- Current state: Page is missing.

**Acceptance Criteria**
- Page contains the three sections with consistent styling and spacing.
- Page uses existing theme typography and color system.

**Verification**
- Visual check on desktop and mobile.

## 3C Publish and link the About page

- [ ] Publish the About Us page.
- [ ] Link it in the main navigation.
- Current state: No published page; header/footer links point to a non-existent page.

**Acceptance Criteria**
- `/pages/about-us` (or final slug) loads without errors.
- Navigation and footer link to the live page.

**Verification**
- Click About Us from header and footer.

## Inventory Notes

- Current state: About Us must be created from scratch; no existing text/images captured here.

# 4 Our Process page refinement

## 4A Organise existing content

- [ ] Copy the current text describing: Careful Sourcing, Precision Crafting, Third-Party Testing, Premium Packaging & Delivery.
- Current state: `/pages/our-process` contains the four headings and paragraphs already (text-only).

**Acceptance Criteria**
- Existing copy is preserved and structured into discrete sections.

**Verification**
- Confirm all four sections appear in order.

## 4B Edit the copy for clarity and conciseness

- [ ] Edit for clarity and conciseness.
- [ ] Emphasise deliberate, pharmacist-led formulation.
- Current state: Copy exists but has not been edited.

**Acceptance Criteria**
- Copy is concise, brand-aligned, and avoids medical claims.

**Verification**
- Review copy with compliance/brand owner.

## 4C Add visuals for each step

- [ ] Add visuals for each step (icons/photos).
- [ ] Provide alt text for each visual.
- Current state: Text only; no icons/images.

**Acceptance Criteria**
- Each step has a visual with alt text or decorative attributes.

**Verification**
- Inspect images in desktop and mobile views.

## 4D Improve layout and add a CTA

- [ ] Redesign layout using blocks or a timeline.
- [ ] Add a final CTA linking to Blends or Wholesale.
- Current state: Single-column text; no CTA at bottom.

**Acceptance Criteria**
- Layout is multi-section and visually scannable.
- CTA routes to the approved page and uses approved label.

**Verification**
- Click CTA and confirm route.

## 4E Test and publish

- [ ] Verify formatting on desktop and mobile.
- [ ] Publish changes (if drafts are used).
- Current state: Page is live but lacks design elements, imagery, and CTAs.

**Acceptance Criteria**
- No layout issues on mobile; spacing and typography consistent.

**Verification**
- Desktop + mobile review.

## Inventory Notes

- Current state: Process content is available but needs layout/visuals and a CTA.

# 5 Blends page development

## 5A Gather product information

- [ ] Compile list of blends.
- [ ] Capture descriptions.
- [ ] Capture key cannabinoids.
- [ ] Capture terpene profiles.
- [ ] Capture intended effects.
- Current state: `/collections/all` lists three products. Product pages contain varying description detail; some include cannabinoid percentage info.

- Current state: Headspace Elevate product page description begins: “Hemp-derived cannabinoid disposable vape (2 g). See COA for batch details. B1-Headspace Elevate is a premium blend featuring Grandaddy Purp and Watermelon flavors, with a high HC content of 71%. It also contains 4% THC-P …”.
- Current state: JennaBoo product page description is minimal: “Hemp-derived cannabinoid disposable vape (2 g). See COA for batch details.”
- Current state: Whispering Roots product page description includes percentages (e.g., 71% HC, 4% HC-P, 5% CBD, CBG, CBN, 3% CBC, 7% terpenes).

**Acceptance Criteria**
- Each blend has a consistent, approved description and data points (cannabinoids, terpenes, effects).

**Verification**
- Cross-check against COA PDFs for accuracy.

## 5B Create product profile blocks

- [x] Create a product profile block for each blend with image.
- [x] Add name and a 2–3 sentence description.
- [x] Add highlights: cannabinoids/terpenes and intended effects.
- [x] Add link to the product’s COA.
- Current state: `blends-profiles` section and `page.blends` template are in the theme. Each block uses a product picker to prefill name, image, and description; highlights and COA links can be overridden. COA links default to `product.metafields.custom.coa_url` and open in a new tab.

**Acceptance Criteria**
- Each blend profile includes image, short description, highlights, and COA link.
- COA link labels are descriptive and open the correct PDF.

**Verification**
- Click each COA link; verify PDF and naming.

## 5C Replace retail CTAs with wholesale-friendly CTAs

- [x] Replace “Add to cart” with “Contact for wholesale” or “Join our mailing list”.
- [x] Remove pricing.
- [x] Remove purchasing functionality.
- Current state: Collection cards, predictive search suggestions, featured product blocks, and shoppable tooltips now show a “Partner with us” CTA linking to `/pages/wholesale`. Product pages remain retail, but will be hidden via Shopify admin.

**Acceptance Criteria**
- No price or purchase buttons appear on blends listings.
- CTA routes to contact/wholesale form.

**Verification**
- Inspect product and blends pages for price/cart elements.

## 5D Publish and link the Blends page

- [ ] Publish a Blends page (`/pages/blends`).
- [ ] Add Blends to the navigation menu.
- [ ] Confirm each COA link works.
- [ ] Confirm CTA buttons route to contact/sign-up forms.
- Current state: `page.blends` template is ready with three profile blocks. Admin still needs to create the Blends page, assign this template, and link it in menus before verifying COA links and CTAs.

**Acceptance Criteria**
- Blends page is live and linked from header and footer.
- All CTA and COA links work.

**Verification**
- Navigate via menu and test all links.

## Inventory Notes

- Current state: Retail purchase flows are removed from collection/search surfaces and replaced by wholesale CTAs. Product pages will be hidden in Shopify admin. Blends page template exists, but CTA replacement and menu linkage still need admin follow-up.

# 6 COAs page improvement

## 6A Strengthen the introduction

- [ ] Write an intro explaining what COAs are.
- [ ] Explain why COAs matter (safety, transparency, compliance).
- [ ] Encourage visitors to view COAs for each product.
- Current state: Current intro explains where to find batch COAs but does not emphasize why they matter.

**Acceptance Criteria**
- Intro includes a brief COA definition and compliance rationale.

**Verification**
- Review copy for clarity and compliance.

## 6B Organise COA links

- [ ] Group links by product type (if many variants exist).
- [ ] Use clear link text (avoid bare URLs).
- Current state: Page lists three bullet links (Whispering Roots, Headspace Elevate, JennaBoo); grouping not necessary currently.

**Acceptance Criteria**
- COA links are descriptive and easy to scan.

**Verification**
- Click each link; confirm correct PDF.

## 6C Accessibility and link behaviour

- [ ] Add alt text for any thumbnails (if added).
- [ ] Ensure each COA link opens in a new tab.
- Current state: No thumbnails; links open PDFs in the same tab.

**Acceptance Criteria**
- COA links open in a new tab and remain accessible.

**Verification**
- Click each COA link and confirm new tab behavior.

## 6D Publish and update navigation

- [ ] Add COAs to the main header navigation.
- [ ] Confirm footer link labeling is consistent.
- Current state: COAs page is live; linked from home CTA and footer; not linked from the header.

**Acceptance Criteria**
- COAs appears in header navigation and footer label matches header.

**Verification**
- Check header and footer menus.

## Inventory Notes

- Current state: COAs page works but needs a stronger intro and improved link behavior (new tab).

# 7 Compliance & Legal page creation

## 7A Research and draft requirements

- [ ] Research regulatory requirements relevant to the products and audience.
- [ ] Draft required health and safety warnings.
- Current state: `/pages/compliance` contains no content (standard footer only).

**Acceptance Criteria**
- Compliance requirements are documented and approved before publishing.

**Verification**
- Review with legal/compliance stakeholder.

## 7B Draft the page content

- [ ] Add legal compliance statements.
- [ ] Add age restriction language.
- [ ] Add warnings.
- [ ] Add statement that the site does not sell directly.
- [ ] Link to privacy policy and terms of service.
- Current state: Missing.

**Acceptance Criteria**
- Page includes required warnings, age restrictions, and non-retail statement.

**Verification**
- Review copy with compliance stakeholder.

## 7C Build and publish

- [ ] Build the Compliance & Legal page content in Shopify.
- [ ] Publish and link from navigation or footer.
- Current state: Placeholder exists but is empty.

**Acceptance Criteria**
- Compliance page is live and linked from footer/navigation.

**Verification**
- Verify link routes to live page.

## Inventory Notes

- Current state: Compliance content must be created from scratch; verify if any draft exists in admin.

# 8 Wholesale information page

## 8A Develop the outline

- [ ] Explain benefits of partnering with Dr Js (exclusive formulations, bulk pricing, marketing assets).
- [ ] List requirements for wholesale partners (valid licence, minimum orders, adherence to age laws).
- [ ] Draft a wholesale FAQ.
- Current state: No wholesale page exists; no wholesale partnership info provided.

**Acceptance Criteria**
- Outline covers benefits, requirements, and FAQ topics.

**Verification**
- Review outline with stakeholders.

## 8B Design the page and CTA

- [ ] Create sections: Why Partner, Requirements, FAQ.
- [ ] Add a prominent wholesale application CTA linking to a form.
- Current state: Not implemented.

**Acceptance Criteria**
- Page sections are clearly separated with a prominent CTA.

**Verification**
- Confirm CTA routes to form.

## 8C Decide the application method

- [ ] Decide application method (simple contact form vs detailed submission).
- [ ] Configure the form to send to a wholesale email address.
- [ ] Add Wholesale page to navigation.
- [ ] Test submissions.
- Current state: No wholesale form exists.

**Acceptance Criteria**
- Wholesale form captures required info and routes to the wholesale inbox.
- Wholesale page appears in navigation.

**Verification**
- Submit a test entry and confirm delivery.

## Inventory Notes

- Current state: Wholesale portal is absent; content and forms must be planned and built.

# 9 Contact page refinement

## 9A Simplify and clarify the form

- [ ] Simplify to fields: name, email, message, optional phone number.
- [ ] Add a dropdown to choose enquiry type: General Enquiry vs Wholesale Enquiry.
- Current state: Contact page lists categories in plain text and uses form fields Name, Phone number, Email (required), Comment. No dropdown; button reads “SEND A FORM”.

**Acceptance Criteria**
- Contact form fields match the simplified list and include enquiry type dropdown.

**Verification**
- Submit test form for each enquiry type.

## 9B Confirm routing

- [ ] Ensure General enquiries route to the general inbox.
- [ ] Ensure Wholesale enquiries route to the wholesale inbox.
- Current state: Routing cannot be verified without submitting; admin confirmation needed.

**Acceptance Criteria**
- Each enquiry type routes to the correct inbox.

**Verification**
- Confirm receipt in the intended inboxes.

## 9C Add contact details

- [ ] Add a visible contact email.
- [ ] Add an optional postal address.
- [ ] Use icons or simple formatting for readability.
- Current state: Contact page does not list email/address. Privacy policy includes `jordan@drjspremiumblends.com` and “402 Forest Trail, Kingston, TN, 37763, US”.

**Acceptance Criteria**
- Contact email and optional address are visible on the page.

**Verification**
- Visual check on desktop/mobile.

## 9D Publish and test

- [ ] Publish updates.
- [ ] Test dropdown routing and form submission.
- Current state: Form exists but has no dropdown; routing cannot be verified without submitting.

**Acceptance Criteria**
- Updated contact form is live and submits successfully.

**Verification**
- Submit test messages for each enquiry type.

## Inventory Notes

- Current state: Convert the written category list into a dropdown and add visible contact details.

# 10 Accessibility and SEO improvements

## 10A Add alt text

- [ ] Add descriptive alt text to all images (hero, icons, product photos).
- Current state: Not verifiable from public storefront; requires admin/theme inspection.

**Acceptance Criteria**
- All meaningful images have descriptive alt text; decorative images are marked accordingly.

**Verification**
- Inspect rendered HTML or theme assets.

## 10B Use semantic headings

- [ ] Ensure H1 for page title.
- [ ] Use H2 for major sections and avoid skipping heading levels.
- Current state: Visual headings exist but HTML hierarchy not confirmed; needs theme inspection.

**Acceptance Criteria**
- Each page uses a single H1 and follows a logical hierarchy.

**Verification**
- Inspect DOM heading structure.

## 10C Write meta titles and descriptions

- [ ] Write meta titles and descriptions for each page.
- [ ] Configure in Shopify.
- Current state: Not visible from storefront; admin required.

**Acceptance Criteria**
- Each page has a unique meta title and description.

**Verification**
- Confirm in Shopify admin and in rendered HTML.

## 10D Sitemap and robots rules

- [ ] Confirm sitemap is available and accurate.
- [ ] Adjust robots rules if needed (e.g., exclude wholesale application if sensitive).
- Current state: Not evaluated here.

**Acceptance Criteria**
- Sitemap includes all public pages; sensitive pages are excluded if required.

**Verification**
- Review `/sitemap.xml` and robots settings.

## 10E Accessibility testing

- [ ] Test with accessibility tools.
- [ ] Fix issues (contrast, alt text, heading order, focus states).
- Current state: Not performed.

**Acceptance Criteria**
- No high-severity accessibility issues remain.

**Verification**
- Run Lighthouse or axe and fix flagged issues.

## 10F Indexing review

- [ ] Verify legal and policy pages are indexable as intended.
- Current state: Not assessed.

**Acceptance Criteria**
- Indexing status matches compliance requirements.

**Verification**
- Review meta robots and Search Console (if available).

## Inventory Notes

- Current state: Improvements require theme editing and admin access; captured content will help write alt text and descriptions later.

# 11 Technical cleanup and theme settings

## 11A Disable retail sales

- [ ] Mark products as unavailable for the online store sales channel.
- [ ] Remove checkout links and retail purchase features from theme.
- Current state: Products are purchasable; price/Add to cart/PayPal buttons are present. Header search/account/cart entry points have been removed in theme.

**Acceptance Criteria**
- Products are not purchasable from the storefront (no cart/checkout flows).
- Retail purchase buttons are removed or replaced with wholesale CTAs.

**Verification**
- Confirm product pages show no price or add-to-cart.
- Verify cart/checkout cannot be accessed from the storefront.

## 11B Remove or repurpose unused pages

- [ ] Remove or rewrite Shipping & Returns for wholesale context (or replace link).
- [ ] Remove or repurpose Track Order page.
- Current state: Shipping & Returns is a 404; Track Order is an app page (retail-oriented).

**Acceptance Criteria**
- Footer/menu links no longer point to 404s or retail-only pages.

**Verification**
- Click all footer links and confirm no 404s.

## 11C Update theme styles

- [ ] Define cohesive colour palette and fonts.
- [ ] Ensure high-contrast buttons and clear hover states.
- Current state: Dark backgrounds with green/white accents; buttons are olive green with white text; hover states subtle.

**Acceptance Criteria**
- Updated palette and typography are consistent across pages.
- Buttons meet contrast guidelines and have visible hover/focus states.

**Verification**
- Visual spot-check on key pages; run contrast checker if needed.

## 11D Review for consistency

- [ ] Audit all pages on desktop.
- [ ] Audit all pages on mobile.
- [ ] Fix broken links, spacing issues, misaligned elements.
- [ ] Document minor corrections.
- Current state: Broken links exist (About Us, Shipping & Returns). Compliance & Legal and About Us lack content. Product descriptions vary. Full style audit pending.

**Acceptance Criteria**
- No broken links remain; layout is consistent on desktop/mobile.

**Verification**
- Manual page-by-page review on desktop and mobile.

## Inventory Notes

- Current state: Disabling retail requires admin actions (product availability, theme icons/buttons). Broken links must be removed or replaced.

# 12 Final review and next steps

## 12A Validate all pages

- [ ] Confirm navigation links work.
- [ ] Confirm CTAs route correctly.
- [ ] Confirm forms submit correctly.
- [ ] Ensure no references to retail purchasing remain.
- Current state: Retail elements remain (Our Shop, Add to cart). Contact form lacks dropdown. COA links work. Wholesale and compliance content missing.

**Acceptance Criteria**
- All navigation/CTA links work without 404s.
- No retail purchase flows remain.

**Verification**
- Click through header/footer and all CTAs on desktop and mobile.

## 12B Prepare for content refinement

- [ ] List required inputs for each section (copy, USPs, images).
- [ ] Standardise product descriptions across blends.
- [ ] Draft final wording for missing pages.
- Current state: About Us, brand story, USPs, and wholesale details are missing. Product descriptions vary and need standardisation. Images need selection.

**Acceptance Criteria**
- Content inventory is complete and assigned to owners.

**Verification**
- Review content checklist with stakeholders.

## 12C Plan wholesale portal implementation (future phase)

- [ ] Research Shopify wholesale apps or sub-domain setups.
- [ ] Outline portal tasks (registration, pricing tiers, order forms).
- Current state: Wholesale functionality not started; no apps confirmed publicly.

**Acceptance Criteria**
- Shortlist of wholesale solutions with pros/cons and recommended path.

**Verification**
- Stakeholder review/approval of the selected approach.

## Recommended next steps

1. Complete 1D and 1E (hero + brand story) to remove retail focus from the home page.
2. Update 2A/2B navigation and footer to remove retail links and add Wholesale.
3. Create the Blends page (5B-5D) and replace retail CTAs (5C).
4. Draft Compliance & Legal content (7A-7C) and Wholesale page outline (8A).
5. Run a full desktop/mobile review after the above changes (11D).

# Appendix

## A. Full storefront site map

| Page name | URL | Where linked | Notes |
| --- | --- | --- | --- |
| Home | `/` | Header “Home” | Hero with tagline, product grid, promos, newsletter, footer |
| Our Shop / All Products | `/collections/all` | Header “Our Shop”; hero CTA “Explore blends” | Displays 3 products with price and Add to cart buttons |
| Headspace Elevate product | `/products/headspace-elevate-2g` | Product card on collection page | Shows product image, price $44.95, variant selector, Add to cart and PayPal buttons; description includes HC content |
| Whispering Roots product | `/products/whispering-rots-2g` | Product card on collection page | Shows price $44.95; description notes cannabinoid percentages |
| JennaBoo product | `/products/jennaboo-2g` | Product card on collection page | Price $44.95; minimal description |
| Contact Us | `/pages/contact` | Header “Contact Us”; footer link | Categories listed in text; form fields Name, Phone number, Email*, Comment; button “SEND A FORM”; no dropdown |
| Track order status | `/apps/track123` | Footer “Track Order” | App page with tracking form (order number + email/phone); retail-oriented |
| Data-sharing opt-out | `/pages/data-sharing-opt-out` | Footer link | Checkbox and OPT OUT button |
| About Us | `/pages/about-us` | Footer link | 404 Not Found |
| Our Process | `/pages/our-process` | Footer link | Live; text-only; no CTA |
| Certificates of Analysis (COAs) | `/pages/certificates-of-analysis-coas` | Home CTA; footer link | Live; needs stronger intro; PDFs open same tab |
| Compliance & Legal | `/pages/compliance` | Footer link | Empty content (footer only) |
| Shipping & Returns | `/pages/shipping-returns` | Footer link | 404 Not Found |
| FAQs | `/pages/faqs` | Footer link | Live |
| Privacy policy | `/policies/privacy-policy` | Footer link | Live |
| Refund policy | `/policies/refund-policy` | Footer link | Live |
| Shipping policy | `/policies/shipping-policy` | Footer link | Live |
| Terms of Service | `/policies/terms-of-service` | Footer link | Live |
