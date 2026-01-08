import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');

const readThemeFile = (relativePath: string) => {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
};

test('section heading defaults use safe fallbacks', () => {
  const videoSection = readThemeFile('sections/video-section.liquid');

  expect(videoSection).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(videoSection).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(videoSection).toMatch(
    /--font-headline-scale-desk:\s*{{\s*block\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(videoSection).toMatch(
    /--font-headline-scale:\s*{{\s*block\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const videoReels = readThemeFile('sections/video-reels.liquid');
  expect(videoReels).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(videoReels).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
});

test('features banner avoids duplicate headline scale overrides', () => {
  const featuresBanner = readThemeFile('sections/features-banner.liquid');
  const styleContent = featuresBanner.split('</style>')[0];

  expect(styleContent).not.toMatch(/\.wt-keys__title[\s\S]*--font-headline-scale/);
});
