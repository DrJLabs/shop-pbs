import { test, expect } from '@playwright/test';
import { readThemeFile } from './test-utils';

test('footer disclaimer styles and headline alignment remain configurable', () => {
  const css = readThemeFile('assets/main.css');

  expect(css).toContain('.wt-footer__disclaimer');
  expect(css).toContain('.wt-footer__disclaimer p');

  const headlineAlignRegex =
    /\.headline\s*\{[^}]*text-align:\s*var\(--heading-align,\s*center\);/s;
  expect(css).toMatch(headlineAlignRegex);
});

test('collection feature keeps large heading defaults', () => {
  const section = readThemeFile('sections/collection-feature.liquid');

  const desktopMatches =
    section.match(
      /--font-headline-scale-desk:\s*\{\{\s*section\.settings\.size_heading\s*\|\s*default:\s*250\s*\|\s*divided_by:\s*100\.0\s*\}\};/g,
    ) ?? [];
  const mobileMatches =
    section.match(
      /--font-headline-scale:\s*\{\{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*200\s*\|\s*divided_by:\s*100\.0\s*\}\};/g,
    ) ?? [];

  // Expect 2 matches: section-level declaration and container-level override.
  expect(desktopMatches.length).toBe(2);
  expect(mobileMatches.length).toBe(2);
});
