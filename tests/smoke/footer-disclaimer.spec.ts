import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');

const readThemeFile = (relativePath: string) => {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
};

const DISCLAIMER_NEEDLE =
  'These statements have not been evaluated by the Food and Drug Administration';

test('footer exposes the disclaimer setting and defaults', () => {
  const footerSection = readThemeFile('sections/page-footer.liquid');

  expect(footerSection).toContain('section.settings.disclaimer_text');
  expect(footerSection).toMatch(/"id"\s*:\s*"disclaimer_text"/);
  expect(footerSection).toMatch(/"type"\s*:\s*"richtext"/);
  expect(footerSection).toMatch(/t:sections\.footer\.settings\.disclaimer_text\.label/);

  const footerGroup = readThemeFile('sections/footer-group.json');
  expect(footerGroup).toContain('"disclaimer_text"');

  const settingsData = readThemeFile('config/settings_data.json');
  expect(settingsData).toContain('"disclaimer_text"');
});

test('page templates avoid duplicate FDA disclaimer copy', () => {
  const blendsTemplate = readThemeFile('templates/page.blends.json');
  const whisperingRootsTemplate = readThemeFile('templates/page.whispering-roots.json');

  expect(blendsTemplate).not.toContain(DISCLAIMER_NEEDLE);
  expect(whisperingRootsTemplate).not.toContain(DISCLAIMER_NEEDLE);
});
