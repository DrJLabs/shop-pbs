import { test, expect } from '@playwright/test';
import { parseJsonWithComments, readThemeFile } from './test-utils';
import type { ShopifyTemplate } from './test-utils';

test('main 404 and multicolumn sections retain heading alignment setting', () => {
  const main404 = readThemeFile('sections/main-404.liquid');
  expect(main404).toContain('--heading-align');
  expect(main404).toMatch(/"id"\s*:\s*"heading_alignment"/);

  const multicolumn = readThemeFile('sections/multicolumn.liquid');
  expect(multicolumn).toContain('--heading-align');
  expect(multicolumn).toMatch(/"id"\s*:\s*"heading_alignment"/);
});

test('templates keep heading alignment defaults', () => {
  const indexTemplate = parseJsonWithComments(
    readThemeFile('templates/index.json'),
  ) as ShopifyTemplate;
  const blendsTemplate = parseJsonWithComments(
    readThemeFile('templates/page.blends.json'),
  ) as ShopifyTemplate;

  const hasHeadingAlignment = (template: ShopifyTemplate) =>
    Object.values(template.sections ?? {}).some(
      (section) => section.settings?.heading_alignment !== undefined,
    );

  expect(hasHeadingAlignment(indexTemplate)).toBe(true);
  expect(hasHeadingAlignment(blendsTemplate)).toBe(true);
});
