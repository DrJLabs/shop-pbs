import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const execFileAsync = promisify(execFile);

test('preview url script does not execute env command substitutions', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-url-'));
  const envPath = path.join(tmpDir, '.env');
  const markerPath = path.join(tmpDir, 'pwned');

  const envContents = [
    'SHOPIFY_SHOP=test-shop',
    'SHOPIFY_DEV_THEME_ID=123',
    `MALICIOUS=$(touch ${markerPath})`,
  ].join('\n');

  await fs.writeFile(envPath, envContents);

  try {
    const scriptPath = path.join(process.cwd(), 'scripts/shopify/preview-url.sh');
    await execFileAsync('bash', [scriptPath, '--env', envPath], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    const markerExists = await fs
      .stat(markerPath)
      .then(() => true)
      .catch(() => false);
    expect(markerExists).toBe(false);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test('preview url script trims unquoted env values', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-url-'));
  const envPath = path.join(tmpDir, '.env');

  const envContents = [
    'SHOPIFY_SHOP=   test-shop   ',
    'SHOPIFY_DEV_THEME_ID=  123  ',
  ].join('\n');

  await fs.writeFile(envPath, envContents);

  try {
    const scriptPath = path.join(process.cwd(), 'scripts/shopify/preview-url.sh');
    const { stdout } = await execFileAsync('bash', [scriptPath, '--env', envPath], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    expect(stdout.trim()).toBe('https://test-shop.myshopify.com/?preview_theme_id=123');
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
