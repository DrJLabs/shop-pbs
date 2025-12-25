import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('pb-hero-topo section includes required schema fields', async () => {
  const filePath = path.join(process.cwd(), 'sections', 'pb-hero-topo.liquid');
  const content = await readFile(filePath, 'utf8');
  const pictureMatches = content.match(/<picture\b/g) ?? [];
  const actionsMatches = content.match(/<div class="pb-hero-topo__actions">/g) ?? [];
  expect(content).toContain('PB Hero - Topo');
  expect(content).toContain('"scrim_strength"');
  expect(content).toContain('"content_max_width"');
  expect(content).toContain('"accent_color"');
  expect(content).toContain('"chip"');
  expect(content).toContain('pb-hero-topo');
  expect(pictureMatches).toHaveLength(1);
  expect(content).toContain('<source');
  expect(content).toContain('media="(max-width: 749px)"');
  expect(actionsMatches).toHaveLength(1);
});
