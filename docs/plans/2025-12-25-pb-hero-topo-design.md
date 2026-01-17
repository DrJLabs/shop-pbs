# PB Hero Topo Design

## Goal

Add a new OS 2.0 section (`pb-hero-topo`) that renders a full-width homepage hero with editable copy, CTAs, trust chips, and a configurable scrim over a theme-editor-selected background image.

## Layout

- Full-width hero with a background image set via section settings.
- Copy column on the left; image visual bias on the right via `object-position: right center`.
- Left-to-right scrim overlay for readability, controlled by a `scrim_strength` slider.

## Content

- Kicker, headline, subhead, microline text settings.
- Primary and secondary CTA labels/links.
  - If a label is set but no link is provided, render a disabled `<button>` so missing links are visible.
- Trust chips rendered as blocks (max 6) inside a `<ul>`.

## Responsiveness

- CTA buttons stack vertically on mobile.
- Content width constrained by a `content_max_width` setting.
- Optional center alignment using a `content_align` setting.

## Accessibility

- CTA buttons are real elements (no text baked into images).
- Background image uses image alt text where available.
- Scrim is decorative (`aria-hidden="true"`).

## Implementation Notes

- Section-scoped CSS only (no theme-wide edits).
- `<picture>` element with desktop and optional mobile images (mobile defaults to desktop).
- CSS variables on the root for scrim strength, content width, and accent color.
