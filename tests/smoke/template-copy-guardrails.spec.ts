import { test, expect } from '@playwright/test';
import { parseJsonWithComments, readThemeFile } from './test-utils';
import type { ShopifySection, ShopifySettingsData, ShopifyTemplate } from './test-utils';

test('parses JSON with multiple block comments', () => {
  const sample = '/*first*/\n{"key": "value"}\n/*second*/';
  expect(parseJsonWithComments(sample)).toEqual({ key: 'value' });
});

test('blend page text blocks avoid inline FDA disclaimers', () => {
  const settingsData = parseJsonWithComments(
    readThemeFile('config/settings_data.json'),
  ) as ShopifySettingsData;
  const templates = settingsData.current?.templates ?? {};
  const disclaimerNeedle =
    'These statements have not been evaluated by the Food and Drug Administration';
  const coaLinkRegex = /View the batch-specific COA:\s*https:\/\/[^\s<]+/;
  const duplicateCannabinoidRegex = /(\b[A-Z]{2,}(?:-[A-Z]{1,})?\b)\s*\/\s*\1\b(?!-)/i;
  const blendTexts: string[] = [];

  Object.values(templates).forEach((template) => {
    const sections = template.sections;
    if (!sections) {
      return;
    }
    Object.values(sections).forEach((section) => {
      if (section.type === 'blend-page') {
        const text = section.settings?.text;
        if (typeof text === 'string') {
          blendTexts.push(text);
        }
      }
    });
  });

  expect(blendTexts.length).toBeGreaterThan(0);
  blendTexts.forEach((text) => {
    const trimmed = text.trim();

    expect(text).not.toContain(disclaimerNeedle);
    expect(text).not.toContain('[insert COA link]');
    expect(text).toMatch(coaLinkRegex);
    expect(text).not.toMatch(duplicateCannabinoidRegex);
    expect(trimmed.startsWith('<div>')).toBe(false);
    expect(trimmed.endsWith('</div>')).toBe(false);
  });
});

test('home blends section keeps the large headline defaults', () => {
  const indexTemplate = parseJsonWithComments(
    readThemeFile('templates/index.json'),
  ) as ShopifyTemplate;
  const multicolumnSection = Object.values(indexTemplate.sections ?? {}).find(
    (section) =>
      section.type === 'multicolumn' && section.settings?.heading === 'Our Signature Blends',
  ) as ShopifySection | undefined;

  expect(multicolumnSection).toBeDefined();
  expect(multicolumnSection?.settings?.heading).toBe('Our Signature Blends');
  expect(multicolumnSection?.settings?.size_heading).toBe(150);
  expect(multicolumnSection?.settings?.size_heading_mobile).toBe(150);
});

test('wholesale portal keeps large heading sizes with transparent colors', () => {
  const wholesaleTemplate = parseJsonWithComments(
    readThemeFile('templates/page.wholesale-portal.json'),
  ) as ShopifyTemplate;
  const mainSection = wholesaleTemplate.sections?.main as ShopifySection | undefined;

  expect(mainSection?.type).toBe('main-page');
  expect(mainSection?.settings?.['compact-size-enabled']).toBe(false);
  expect(mainSection?.settings?.size_heading).toBe(200);
  expect(mainSection?.settings?.size_heading_mobile).toBe(200);
  expect(mainSection?.settings?.['color-body-text']).toBe('transparent');
  expect(mainSection?.settings?.['color-bg-overlay']).toBe('transparent');

  const formSection = wholesaleTemplate.sections?.form as
    | Pick<ShopifySection, 'settings'>
    | undefined;
  expect(formSection?.settings?.background_color).toBe('transparent');
});
