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
  "additionalProperties": {
    "type": "string"
  }
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

lines=$(wc -l < "$TMP/template.json")
if [ "$lines" -ne 1 ]; then
  echo "Expected 1 line but got $lines lines"
  exit 1
fi

"$1" compile "$TMP/schema.json" --minify | grep -q "dynamic"
