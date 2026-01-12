import { test, expect } from '@playwright/test';
import { readThemeFile } from './test-utils';

test('pb hero topo section includes required schema fields', () => {
  const content = readThemeFile('sections/pb-hero-topo.liquid');
  const pictureMatches = content.match(/<picture\b/g) ?? [];
  const actionsMatches = content.match(/<div class="pb-hero-topo__actions">/g) ?? [];

  expect(content).toContain('PB Hero - Topo');
  expect(content).toContain('"scrim_strength"');
  expect(content).toContain('"content_max_width"');
  expect(content).toContain('"accent_color"');
  expect(content).toContain('"chip"');
  expect(content).toContain('pb-hero-topo');
  expect(content).toContain('#shopify-section-{{ section.id }}');
  expect(pictureMatches).toHaveLength(1);
  expect(content).toContain('<source');
  expect(content).toContain('media="(max-width: 749px)"');
  expect(actionsMatches).toHaveLength(1);
});

test('pb hero topo heading defaults use safe fallbacks', () => {
  const pbHeroTopo = readThemeFile('sections/pb-hero-topo.liquid');

  expect(pbHeroTopo).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(pbHeroTopo).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
});

test('pb hero topo exposes a left content offset setting', () => {
  const pbHeroTopo = readThemeFile('sections/pb-hero-topo.liquid');

  expect(pbHeroTopo).toMatch(
    /--pb-content-left-offset:\s*{{\s*section\.settings\.content_left_offset\s*\|\s*default:\s*24\s*}}\s*px;/
  );
  expect(pbHeroTopo).toMatch(
    /(?:#shopify-section-\{\{\s*section\.id\s*\}\}\s+)?\.pb-hero-topo--align-left\s+\.pb-hero-topo__content\s*\{[\s\S]*?margin-inline-start:\s*var\(--pb-content-left-offset\);/
  );
  expect(pbHeroTopo).toMatch(/"id":\s*"content_left_offset"/);
});
