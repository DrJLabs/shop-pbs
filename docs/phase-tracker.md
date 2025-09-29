# Phase Implementation Tracker

This document tracks progress across the seven Shopify theme design phases and captures the detailed checklist for Phase 5 (Trust-Building & Transparency). Update it as work progresses.

## Phase Overview

| Phase | Status | Outcomes / Goals | Key Artifacts | Acceptance / Next Actions |
| --- | --- | --- | --- | --- |
| Phase 1 — Mobile-First & Responsive | ✅ Done | Establish responsive patterns, performance rules, testing matrix. | `mobile_design_examples.md` | Base layout scales cleanly, tap targets ≥44×44, AA contrast met. |
| Phase 2 — Navigation & Product Discovery | ✅ Done | Clear menus, prominent search, breadcrumbs, footer nav. | `navigation_design_examples.md` | Header shows main actions, search easy to find, orientation maintained. |
| Phase 3 — Visual Identity & Aesthetic Consistency | 🟡 In progress (locked decisions) | Dark-first theme (light variant for COA/Policy/Wholesale); brand palette; typography (Cinzel + Inter); accessibility guardrails. | Decision Log v1.0, tokenized CSS, Shopify wiring | Next: integrate tokens, color schemes, and fonts into Dawn; preview locally. Open inputs: logo SVG, COA column set, wholesale form fields. |
| Phase 4 — Conversion Design (CTAs & PDP) | 🟩 Ready | Increase add-to-cart and inquiry conversion via CTA matrix, PDP spec, cart UX. | CTA matrix draft, PDP spec outline, cart UX plan | Acceptance: measurable uplift baseline → variant test. |
| Phase 5 — Trust-Building & Transparency | ⬜ Planned (with active checklist below) | Reduce buyer hesitation via reviews, COA surfacing, trust content. | See Phase 5 tracker | Acceptance: trust elements on PDP, footer policy access, COA links with batch IDs. |
| Phase 6 — Compliance & Legal | ⬜ Planned | Age-gate, disclaimers, notices, accessibility, privacy. | Planned: age-check modal, Prop-65 copy, ADA checklist, cookie banner | Acceptance: passes legal/ADA lint; age-gate unobtrusive on mobile. |
| Phase 7 — Performance & Accessibility (Continuous) | 🟡 Ongoing | LCP ≤2.5s, CLS ≤0.1, TBT ≤200ms; AA contrast. | Lighthouse CI plan, image/font optimization checklist | Actions: lazy-load media, responsive imagery, font `display=swap`, monitor Lighthouse. |

## Phase 5 — Trust & Proof Checklist

| # | Workstream | Status | Notes / Next Steps |
| --- | --- | --- | --- |
| 1 | PDP "Trust Stack" | ✅ Live | Benefits text + policy links toggle; positioned above ATC on default product. Next: spot-check additional product templates. |
| 2 | COA "light" page/template | ✅ Live | `coa-summary` section + `page.coa` template shipped; COA hub page previewed. Next: confirm `<meta name="robots" content="noindex">` renders when `template.suffix == 'coa'`. |
| 3 | Navigation & Surface Area | ✅ Live | Main menu item “COAs / Lab Reports” links to hub. Next: optional footer link. |
| 4 | Structured data / JSON-LD | ⏳ Not started | Merge Product JSON-LD with `additionalProperty` cannabinoid data; remain compatible with theme defaults. |
| 5 | Reviews & UGC | ⏳ Not installed | Install Judge.me (or similar); add PDP stars near title/price; full widget below Trust Stack; optional collection stars. |
| 6 | Automation & Moderation (reviews) | ⏳ Not configured | Enable post-purchase review emails (7–10 days primary, 21–28 days backup); allow photo reviews; set moderation rules. |
| 7 | Policies & trust content | ⏳ Draft | Finalize Shipping, Returns, Age/compliance copy; ensure consistency. |
| 8 | About / Process / Lab methodology | ⏳ Not built | Create "Our Process" page + “Lab methodology” explainer (COA cadence, lab info). |
| 9 | Copy & micro-UX | ⏳ Partial | Complete link labels (e.g., “View COA for [Product]”); add Trust Stack disclaimer (“Batch-specific; see COA for details.”). |
| 10 | Accessibility polish | ⏳ Partial | Confirm contrast + focus states for Trust Stack elements; ensure meaningful alt text on trust icons. |
| 11 | Event tracking | ⏳ Not wired | Instrument GA4 events: `pdp_coa_click`, `pdp_policy_click`, `pdp_reviews_expand`; verify `add_to_cart`. |
| 12 | KPIs & checks | ⏳ Not set | Define dashboard for PDP→ATC rate, PDP exits, review coverage per SKU (≥10 baseline, 50 stretch). |
| 13 | Variant/batch strategy | ⏳ Decision pending | Decide on per-variant COAs; if yes, add variant metafields and dynamic summary swap. |
| 14 | Optional fast wins | ⏳ Not done | Collection card stars (post reviews), footer trust icon row, COA link in order status page + emails. |

### High-Leverage Next Moves

1. Confirm COA `noindex` behavior.
2. Install reviews app, place PDP stars + widget, enable review email automation.
3. Update Product JSON-LD for cannabinoid `additionalProperty` data.
4. Add GA4 tracking for COA/policy/review interactions.
5. (Optional) Add footer trust icons and COA links in order communications.

---

_Last updated: 2025-09-29_
