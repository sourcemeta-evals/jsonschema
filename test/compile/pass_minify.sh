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

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

lines=$(wc -l < "$TMP/template.json")
if [ "$lines" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $lines lines"
  exit 1
fi

grep -q '"dynamic"' "$TMP/template.json" || exit 1
grep -q '"track"' "$TMP/template.json" || exit 1
grep -q '"instructions"' "$TMP/template.json" || exit 1

if grep -q '^  ' "$TMP/template.json"; then
  echo "Expected minified output without indentation"
  exit 1
fi
