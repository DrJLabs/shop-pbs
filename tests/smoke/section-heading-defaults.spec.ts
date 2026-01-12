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

  const backgroundVideo = readThemeFile('sections/background-video.liquid');
  expect(backgroundVideo).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(backgroundVideo).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(backgroundVideo).toMatch(
    /--font-headline-scale-desk:\s*{{\s*block\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(backgroundVideo).toMatch(
    /--font-headline-scale:\s*{{\s*block\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const featuredProduct = readThemeFile('sections/featured-product.liquid');
  expect(featuredProduct).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*80\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(featuredProduct).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*80\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const featuredCollection = readThemeFile('sections/featured-collection.liquid');
  expect(featuredCollection).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(featuredCollection).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const blogPosts = readThemeFile('sections/blog-posts.liquid');
  expect(blogPosts).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(blogPosts).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const mainCollectionBanner = readThemeFile('sections/main-collection-banner.liquid');
  expect(mainCollectionBanner).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(mainCollectionBanner).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const separator = readThemeFile('sections/separator.liquid');
  expect(separator).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(separator).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const shoppableImage = readThemeFile('sections/shoppable-image.liquid');
  expect(shoppableImage).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(shoppableImage).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const slideshow = readThemeFile('sections/slideshow.liquid');
  expect(slideshow).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(slideshow).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const testimonials = readThemeFile('sections/testimonials.liquid');
  expect(testimonials).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(testimonials).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const blendsProfiles = readThemeFile('sections/blends-profiles.liquid');
  expect(blendsProfiles).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(blendsProfiles).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const brands = readThemeFile('sections/brands.liquid');
  expect(brands).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(brands).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const collage = readThemeFile('sections/collage.liquid');
  expect(collage).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(collage).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const collectionFeature = readThemeFile('sections/collection-feature.liquid');
  expect(collectionFeature).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*250\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(collectionFeature).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*200\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const collectionList = readThemeFile('sections/collection-list.liquid');
  expect(collectionList).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(collectionList).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );

  const imageBanner = readThemeFile('sections/image-banner.liquid');
  expect(imageBanner).toMatch(
    /--font-headline-scale-desk:\s*{{\s*section\.settings\.size_heading\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
  expect(imageBanner).toMatch(
    /--font-headline-scale:\s*{{\s*section\.settings\.size_heading_mobile\s*\|\s*default:\s*100\s*\|\s*divided_by:\s*100\.0\s*}};/
  );
});

test('features banner avoids duplicate headline scale overrides', () => {
  const featuresBanner = readThemeFile('sections/features-banner.liquid');
  const styleContent = featuresBanner.split('</style>')[0];

  expect(styleContent).not.toMatch(/\.wt-keys__title[\s\S]*--font-headline-scale/);
});

test('blog posts avoid redundant wt-multicol headline overrides', () => {
  const blogPosts = readThemeFile('sections/blog-posts.liquid');
  expect(blogPosts).not.toMatch(
    /\[data-section-id="{{ section\.id }}"\]\s*\.wt-multicol[\s\S]*--font-headline-scale/
  );
});
