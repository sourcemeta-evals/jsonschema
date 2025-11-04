#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/output.txt"

LINE_COUNT=$(wc -l < "$TMP/output.txt")

if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Expected 1 line, got $LINE_COUNT"
  exit 1
fi

if ! grep -q '"dynamic"' "$TMP/output.txt"; then
  echo "Output does not contain 'dynamic' field"
  exit 1
fi

if ! grep -q '"track"' "$TMP/output.txt"; then
  echo "Output does not contain 'track' field"
  exit 1
fi

if ! grep -q '"instructions"' "$TMP/output.txt"; then
  echo "Output does not contain 'instructions' field"
  exit 1
fi

if grep -q '  ' "$TMP/output.txt"; then
  echo "Output contains multiple spaces (not minified)"
  exit 1
fi
