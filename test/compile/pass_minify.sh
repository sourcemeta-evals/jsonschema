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
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected 1 line, got $LINES lines"
  exit 1
fi

grep -q '"dynamic"' < "$TMP/template.json"

if ! grep -q '"dynamic"' "$TMP/template.json"; then
  echo "Output missing 'dynamic' field"
  exit 1
fi

if ! grep -q '"track"' "$TMP/template.json"; then
  echo "Output missing 'track' field"
  exit 1
fi

if ! grep -q '"instructions"' "$TMP/template.json"; then
  echo "Output missing 'instructions' field"
  exit 1
fi
