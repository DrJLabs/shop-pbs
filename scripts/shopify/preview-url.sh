#!/usr/bin/env bash
set -euo pipefail

env_file=".env"
theme_id=""
path="/"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      env_file="$2"
      shift 2
      ;;
    --theme-id)
      theme_id="$2"
      shift 2
      ;;
    --path)
      path="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--env .env] [--theme-id <id>] [--path /pages/handle]" >&2
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
 done

if [[ ! -f "$env_file" ]]; then
  echo "Env file not found: $env_file" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

if [[ -z "${SHOPIFY_SHOP:-}" ]]; then
  echo "Missing SHOPIFY_SHOP in $env_file" >&2
  exit 1
fi

if [[ -z "$theme_id" ]]; then
  theme_id="${SHOPIFY_DEV_THEME_ID:-}"
fi

if [[ -z "$theme_id" ]]; then
  echo "Missing theme id. Provide --theme-id or set SHOPIFY_DEV_THEME_ID in $env_file" >&2
  exit 1
fi

if [[ -z "$path" ]]; then
  path="/"
fi
if [[ "$path" != /* ]]; then
  path="/$path"
fi

if [[ "$path" == *\?* ]]; then
  sep="&"
else
  sep="?"
fi

printf 'https://%s.myshopify.com%s%spreview_theme_id=%s\n' "$SHOPIFY_SHOP" "$path" "$sep" "$theme_id"
