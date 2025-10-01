#!/usr/bin/env bash
set -euo pipefail

if command -v shopify >/dev/null 2>&1; then
  echo "Shopify CLI is already installed."
  exit 0
fi

echo "Shopify CLI not found; installing via npm packages..."

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install Shopify CLI." >&2
  exit 1
fi

npm install -g @shopify/cli @shopify/theme

echo "Shopify CLI installation complete."
