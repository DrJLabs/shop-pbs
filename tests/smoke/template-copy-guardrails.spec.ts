import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');

const readThemeFile = (relativePath: string) => {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
};

const parseJsonWithComments = (content: string) => {
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return JSON.parse(stripped);
};

test('parses JSON with multiple block comments', () => {
  const sample = '/*first*/\n{"key": "value"}\n/*second*/';
  expect(parseJsonWithComments(sample)).toEqual({ key: 'value' });
});

test('blend page text blocks avoid inline FDA disclaimers', () => {
  const settingsData = parseJsonWithComments(
    readThemeFile('config/settings_data.json')
  );
  const disclaimerNeedle =
    'These statements have not been evaluated by the Food and Drug Administration';
  const blendTexts: string[] = [];

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    const record = node as Record<string, unknown>;
    if (record.type === 'blend-page') {
      const settings = record.settings as Record<string, unknown> | undefined;
      const text = settings?.text;
      if (typeof text === 'string') {
        blendTexts.push(text);
      }
    }

    Object.values(record).forEach(visit);
  };

  visit(settingsData);

  expect(blendTexts.length).toBeGreaterThan(0);
  blendTexts.forEach((text) => {
    expect(text).not.toContain(disclaimerNeedle);
  });
});

test('home blends section keeps the large headline defaults', () => {
  const indexTemplate = parseJsonWithComments(
    readThemeFile('templates/index.json')
  );
  const multicolumnSection = Object.values(
    indexTemplate.sections ?? {}
  ).find((section: { type?: string }) => section.type === 'multicolumn') as
    | { settings?: Record<string, unknown> }
    | undefined;

  expect(multicolumnSection).toBeDefined();
  expect(multicolumnSection?.settings?.heading).toBe('Our Signature Blends');
  expect(multicolumnSection?.settings?.size_heading).toBe(150);
  expect(multicolumnSection?.settings?.size_heading_mobile).toBe(150);
});

test('wholesale portal keeps large heading sizes with transparent colors', () => {
  const wholesaleTemplate = parseJsonWithComments(
    readThemeFile('templates/page.wholesale-portal.json')
  );
  const mainSection = wholesaleTemplate.sections?.main as
    | { type?: string; settings?: Record<string, unknown> }
    | undefined;

  expect(mainSection?.type).toBe('main-page');
  expect(mainSection?.settings?.['compact-size-enabled']).toBe(false);
  expect(mainSection?.settings?.size_heading).toBe(200);
  expect(mainSection?.settings?.size_heading_mobile).toBe(200);
  expect(mainSection?.settings?.['color-body-text']).toBe('transparent');
  expect(mainSection?.settings?.['color-bg-overlay']).toBe('transparent');

  const formSection = wholesaleTemplate.sections?.form as
    | { settings?: Record<string, unknown> }
    | undefined;
  expect(formSection?.settings?.background_color).toBe('transparent');
});
