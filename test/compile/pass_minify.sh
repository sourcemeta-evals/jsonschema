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

if grep -q "^  " "$TMP/template.json"; then
  echo "Error: Output contains indentation, not minified"
  exit 1
fi

if ! grep -q '"dynamic":false' "$TMP/template.json"; then
  echo "Error: Output does not contain expected content"
  exit 1
fi

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Error: Output has $LINES lines, expected 1"
  exit 1
fi
