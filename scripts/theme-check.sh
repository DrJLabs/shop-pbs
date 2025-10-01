#!/usr/bin/env bash
set -euo pipefail

report=$(mktemp)
trap 'rm -f "$report"' EXIT

if ! shopify theme check --fail-level error --output json >"$report"; then
  echo "Theme check CLI exited with non-zero status; parsing report anyway." >&2
fi

error_count=$(jq -r '
  def offense_containers:
    .. | objects | select(has("offenses"));

  def severity_count($severity):
    [offense_containers | (.offenses // [])[] | select((.severity // "") == $severity)] | length;

  (.summary?.error_count // severity_count("error"))
' "$report")
warning_count=$(jq -r '
  def offense_containers:
    .. | objects | select(has("offenses"));

  def severity_count($severity):
    [offense_containers | (.offenses // [])[] | select((.severity // "") == $severity)] | length;

  (.summary?.warning_count // severity_count("warning"))
' "$report")

printf 'Theme Check summary: %s errors, %s warnings\n' "$error_count" "$warning_count"

if [[ "$error_count" != "0" ]]; then
  printf '\nErrors:\n'
  jq -r '
    def offense_containers:
      .. | objects | select(has("offenses"));

    offense_containers
    | select(((.offenses // []) | map((.severity // "") == "error") | any))
    | "- \(.path // .relative_path // .source // "<unknown>")"
  ' "$report"
  exit 1
fi

printf '\nTop warnings (first 10 files):\n'
jq -r '
  def offense_containers:
    .. | objects | select(has("offenses"));

  offense_containers
  | select(((.offenses // []) | map((.severity // "") == "warning") | any))
  | "- \(.path // .relative_path // .source // "<unknown>")"
' "$report" | head -n 10
