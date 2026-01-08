#!/usr/bin/env bash
set -euo pipefail

env_file=".env"
theme_id=""
path="/"

die() {
  echo "$1" >&2
  exit 1
}

require_value() {
  local flag="$1"
  local value="${2-}"
  if [[ -z "$value" || "$value" =~ ^- ]]; then
    die "Error: $flag requires a value."
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      require_value "$1" "${2-}"
      env_file="$2"
      shift 2
      ;;
    --theme-id)
      require_value "$1" "${2-}"
      theme_id="$2"
      shift 2
      ;;
    --path)
      require_value "$1" "${2-}"
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
  die "Env file not found: $env_file"
fi

load_env_file() {
  local line key value trimmed
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    trimmed="${line#"${line%%[![:space:]]*}"}"
    if [[ -z "$trimmed" || "$trimmed" == \#* ]]; then
      continue
    fi
    if [[ "$trimmed" == export\ * ]]; then
      trimmed="${trimmed#export }"
    fi
    if [[ "$trimmed" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      value="${value# }"
      if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value#\"}"
        value="${value%\"}"
      elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value#\'}"
        value="${value%\'}"
      fi
      case "$key" in
        SHOPIFY_SHOP|SHOPIFY_DEV_THEME_ID)
          printf -v "$key" '%s' "$value"
          export "$key"
          ;;
      esac
    fi
  done < "$env_file"
}

load_env_file

if [[ -z "${SHOPIFY_SHOP:-}" ]]; then
  die "Missing SHOPIFY_SHOP in $env_file"
fi

if [[ -z "$theme_id" ]]; then
  theme_id="${SHOPIFY_DEV_THEME_ID:-}"
  if [[ -z "$theme_id" ]]; then
    die "Missing theme id. Provide --theme-id or set SHOPIFY_DEV_THEME_ID in $env_file"
  fi
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
