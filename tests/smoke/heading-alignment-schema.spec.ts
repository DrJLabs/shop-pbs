import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');

const readThemeFile = (relativePath: string) => {
  const fullPath = path.join(projectRoot, relativePath);
  try {
    return readFileSync(fullPath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read theme file at ${relativePath}: ${message}`);
  }
};

test('main 404 and multicolumn sections retain heading alignment setting', () => {
  const main404 = readThemeFile('sections/main-404.liquid');
  expect(main404).toContain('--heading-align');
  expect(main404).toMatch(/"id"\s*:\s*"heading_alignment"/);

  const multicolumn = readThemeFile('sections/multicolumn.liquid');
  expect(multicolumn).toContain('--heading-align');
  expect(multicolumn).toMatch(/"id"\s*:\s*"heading_alignment"/);
});

test('templates keep heading alignment defaults', () => {
  const indexTemplate = readThemeFile('templates/index.json');
  const blendsTemplate = readThemeFile('templates/page.blends.json');

  expect(indexTemplate).toMatch(/"heading_alignment"\s*:/);
  expect(blendsTemplate).toMatch(/"heading_alignment"\s*:/);
});
