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

line_count=$(wc -l < "$TMP/template.json")

if [ "$line_count" -ne 1 ]; then
  echo "Error: Expected minified output to be on a single line, but got $line_count lines"
  exit 1
fi

"$1" validate "$TMP/schema.json" "$TMP/schema.json" > /dev/null 2>&1 || true

if ! grep -q '"dynamic"' "$TMP/template.json"; then
  echo "Error: Output does not contain 'dynamic' field"
  exit 1
fi

if ! grep -q '"track"' "$TMP/template.json"; then
  echo "Error: Output does not contain 'track' field"
  exit 1
fi

if ! grep -q '"instructions"' "$TMP/template.json"; then
  echo "Error: Output does not contain 'instructions' field"
  exit 1
fi
