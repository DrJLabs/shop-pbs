import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');

const readThemeFile = (relativePath: string) => {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
};

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
      /--font-headline-scale-desk: \{\{ section.settings.size_heading \| default: 250 \| divided_by: 100\.0 \}\};/g,
    ) ?? [];
  const mobileMatches =
    section.match(
      /--font-headline-scale: \{\{ section.settings.size_heading_mobile \| default: 200 \| divided_by: 100\.0 \}\};/g,
    ) ?? [];

  expect(desktopMatches.length).toBe(2);
  expect(mobileMatches.length).toBe(2);
});
