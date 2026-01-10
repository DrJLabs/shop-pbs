import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'jsonc-parser';

const projectRoot = process.cwd();

export interface ShopifySection {
  type?: string;
  settings?: Record<string, unknown>;
}

export interface ShopifyTemplate {
  sections?: Record<string, ShopifySection>;
  order?: string[];
}

export interface ShopifySettingsData {
  current?: { templates?: Record<string, ShopifyTemplate> };
}

export const readThemeFile = (relativePath: string) => {
  const fullPath = path.join(projectRoot, relativePath);
  try {
    return readFileSync(fullPath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read theme file at ${relativePath}: ${message}`);
  }
};

export const parseJsonWithComments = (content: string) => {
  return parse(content);
};
