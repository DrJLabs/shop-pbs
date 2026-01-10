import { readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

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
  // Strips block comments (/* ... */). Note: doesn't handle comment-like
  // syntax within JSON string values, but this is acceptable for theme files.
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return JSON.parse(stripped);
};
