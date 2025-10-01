#!/usr/bin/env bash
set -euo pipefail

report=$(mktemp)
trap 'rm -f "$report"' EXIT

if ! shopify theme check --fail-level error --output json >"$report"; then
  echo "Theme check CLI exited with non-zero status; parsing report anyway." >&2
fi

error_count=$(jq '[.[] | .errorCount] | add' "$report")
warning_count=$(jq '[.[] | .warningCount] | add' "$report")

printf 'Theme Check summary: %s errors, %s warnings\n' "$error_count" "$warning_count"

if [[ "$error_count" != "0" ]]; then
  printf '\nErrors:\n'
  jq -r '.[] | select(.errorCount > 0) | "- \(.path)"' "$report"
  exit 1
fi

printf '\nTop warnings (first 10 files):\n'
jq -r '.[] | select(.warningCount > 0) | "- \(.path)"' "$report" | head -n 10
