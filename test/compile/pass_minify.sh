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

LINES="$(wc -l < "$TMP/template.json")"
if [ "$LINES" -ne 1 ]; then
  echo "Expected 1 line (minified), got $LINES lines"
  exit 1
fi

if ! grep -q '"dynamic":false' "$TMP/template.json"; then
  echo "Output does not contain expected JSON structure"
  exit 1
fi

if ! grep -q '"track":true' "$TMP/template.json"; then
  echo "Output does not contain expected JSON structure"
  exit 1
fi

if ! grep -q '"instructions":\[' "$TMP/template.json"; then
  echo "Output does not contain expected JSON structure"
  exit 1
fi
