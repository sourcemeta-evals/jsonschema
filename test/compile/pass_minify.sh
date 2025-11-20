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
  echo "Error: Expected 1 line, got $lines"
  exit 1
fi

if ! grep -q '"dynamic":false' "$TMP/template.json"; then
  echo "Error: Output doesn't contain expected JSON structure"
  exit 1
fi

if ! grep -q '"instructions":\[' "$TMP/template.json"; then
  echo "Error: Output doesn't contain instructions array"
  exit 1
fi
