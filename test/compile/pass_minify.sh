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

"$1" compile --minify "$TMP/schema.json" > "$TMP/template.json"

LINE_COUNT="$(wc -l < "$TMP/template.json")"
if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Expected 1 line in minified output, got $LINE_COUNT"
  exit 1
fi

grep -q "dynamic" < "$TMP/template.json" || {
  echo "Output doesn't appear to be valid JSON template"
  exit 1
}
