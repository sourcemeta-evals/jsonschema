#!/usr/bin/env sh
set -eu

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$tmp/ignoreme" "$tmp/schemas"
printf '{}' > "$tmp/schemas/a.json"

if ! jsonschema lint -i "$tmp/ignoreme" "$tmp/schemas" 2>err.txt; then
  echo "lint failed unexpectedly"
  cat err.txt
  exit 1
fi

if grep -q "unexpected error" err.txt; then
  echo "unexpected error printed"
  cat err.txt
  exit 1
fi
