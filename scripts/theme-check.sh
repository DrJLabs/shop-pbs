#!/usr/bin/env bash
set -euo pipefail

report=$(mktemp)
trap 'rm -f "$report"' EXIT

if ! shopify theme check --fail-level error --output json >"$report"; then
  echo "Theme check CLI exited with non-zero status; parsing report anyway." >&2
fi

error_count=$(jq '([.[] | (.offenses // [])[] | select(.severity == "error")] | length) // 0' "$report")
warning_count=$(jq '([.[] | (.offenses // [])[] | select(.severity == "warning")] | length) // 0' "$report")

printf 'Theme Check summary: %s errors, %s warnings\n' "$error_count" "$warning_count"

if [[ "$error_count" != "0" ]]; then
  printf '\nErrors:\n'
  jq -r '.[] | select(((.offenses // []) | map(.severity == "error") | any)) | "- \(.path // .relative_path)"' "$report"
  exit 1
fi

printf '\nTop warnings (first 10 files):\n'
jq -r '.[] | select(((.offenses // []) | map(.severity == "warning") | any)) | "- \(.path // .relative_path)"' "$report" | head -n 10
