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
  "type": "object"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $LINES lines"
  exit 1
fi

grep -q '"dynamic"' "$TMP/template.json"
grep -q '"track"' "$TMP/template.json"
grep -q '"instructions"' "$TMP/template.json"

if grep -q ': ' "$TMP/template.json"; then
  echo "Expected minified output without pretty-printing spaces"
  exit 1
fi
